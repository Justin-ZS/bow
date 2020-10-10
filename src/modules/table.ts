import {
  ITable, TableData, GroupDescription, FieldDescription,
  IndexSet, TableDescription, AggregateDescription,
  AggregateType,
} from 'Typings';
import { Comparator, Predicate } from 'CommonTypings';
import { pick } from 'PureUtils';

import { getGroupDesc } from './group';
import { getIndexSet } from './filter';
import { getAggregatedTable } from './aggregate';

export default class Table implements ITable {
  private readonly data: TableData;

  private readonly _filterBy: IndexSet;
  private readonly _groups: GroupDescription;
  private readonly _orderBy: Comparator;

  private readonly _fields: FieldDescription[];
  public readonly totalRowCount: number;

  static create(...args: ConstructorParameters<typeof Table>) {
    return new Table(...args);
  }
  create(...args: ConstructorParameters<typeof Table>) {
    return new Table(...args);
  }

  constructor(
    data: TableData,
    meta: {
      fieldDescs: FieldDescription[],
      rowCount: number,
    },
    filter?: IndexSet,
    groupDesc?: GroupDescription,
    order?: Comparator
  ) {
    this.data = data;

    this._fields = meta.fieldDescs;
    this.totalRowCount = meta.rowCount;

    this._filterBy = filter ?? null;
    this._groups = groupDesc ?? null;
    this._orderBy = order ?? null;
  }

  // #region getter
  get isFiltered() {
    return !!this._filterBy;
  }
  get isGrouped() {
    return !!this._groups;
  }
  get isOrdered() {
    return !!this._orderBy;
  }

  get rowCount() {
    return this.isFiltered
      ? this._filterBy.size
      : this.totalRowCount;
  }
  get colCount() {
    return this._fields.length;
  }

  get columns() {
    return this.data;
  }
  get groups() {
    return this._groups;
  }
  get comparator() {
    return this._orderBy;
  }
  get fields() {
    return this._fields;
  }
  // #endregion

  // #region overwrite native api
  get [Symbol.toStringTag]() {
    if (!this._fields) return 'Object'; // bail if called on prototype
    const nr = this.rowCount + ' row' + (this.rowCount !== 1 ? 's' : '');
    const nc = this.colCount + ' col' + (this.colCount !== 1 ? 's' : '');
    return `Table: ${nc} x ${nr}`
      + (this.isFiltered ? ` (${this.totalRowCount} backing)` : '')
      + (this.isGrouped ? `, ${this._groups.size} groups` : '')
      + (this.isOrdered ? ', ordered' : '');
  }
  // #endregion

  private checkRowIdxOverRange(rowIdx: number) {
    if (rowIdx < 0 || rowIdx >= this.totalRowCount) {
      throw Error('Row index over Range!');
    }
  }
  private checkColIdxOverRange(colIdx: number) {
    if (colIdx < 0 || colIdx >= this.colCount) {
      throw Error('Column index over Range!');
    }
  }
  private isRowVisible(rowIdx: number) {
    if (!this.isFiltered) return true;
    return this._filterBy.has(rowIdx);
  }

  public traverse(fn) {
    let rowIdx = 0;
    let end = this.totalRowCount;
    const done = () => end = rowIdx;

    while (rowIdx < end) {
      if (this.isRowVisible(rowIdx)) {
        fn(rowIdx, this.data, done);
      }
      rowIdx += 1;
    }
  }
  public clone({ data, meta, filterBy, groupBy, orderBy }: TableDescription) {
    return Table.create(
      data ?? this.data,
      {
        fieldDescs: meta?.fieldDescs ?? this._fields,
        rowCount: meta?.rowCount ?? this.totalRowCount,
      },
      filterBy ?? this._filterBy,
      groupBy ?? this._groups,
      orderBy ?? this._orderBy
    );
  }
  public getColumnByName(colName: string) {
    return this.data[colName];
  }
  public getFieldDescriptionByName(colName: string) {
    return this.fields.find(f => f.name === colName);
  }
  public getColumnByIdx(colIdx: number) {
    this.checkColIdxOverRange(colIdx);
    return this.data[this._fields[colIdx].name];
  }
  public getCell(colName: string, rowIdx: number) {
    return this.getColumnByName(colName).getDatum(rowIdx);
  }
  public getRowByIdx(rowIdx: number) {
    this.checkRowIdxOverRange(rowIdx);
    return this._fields.map(f => this.data[f.name].getDatum(rowIdx));
  }
  public extractColumnsByNames(colNames: string[]) {
    const columns = pick(colNames, this.data);
    const fieldDescs = this._fields.filter(fd => colNames.includes(fd.name));

    return this.clone({
      data: columns,
      meta: {
        fieldDescs,
      }
    });
  }
  // TODO: waiting for slice method in IColumn
  public subsetRowsByRange(rangeFrom: number, rangeTo: number) {
    this.checkRowIdxOverRange(rangeFrom);
    this.checkRowIdxOverRange(rangeTo);
    if (rangeTo < rangeFrom) throw Error('rangeTo should bigger than rangeFrom!');

    // return this.clone({
    //   data: columns,
    //   meta: {
    //     rowCount: rangeTo - rangeFrom,
    //   }
    // });
  }

  public groupBy(...names: string[]): Table {
    return this.clone({ groupBy: getGroupDesc(names, this) });
  }
  public filterBy(filterPred: Predicate) {
    return this.clone({ filterBy: getIndexSet(filterPred, this) });
  }
  public summarize(aggOpts: any) {
    const isSumAgg = str => {
      const reg = /sum\((.*)\)/i;
      const result = reg.exec(str);

      if (!result) return false;
      if (result[1] === '') return false;
      return true;
    };
    const getFieldName = str => /sum\((.*)\)/i.exec(str)[1];

    const aggDescs: AggregateDescription[] = Object.entries(aggOpts)
      .filter(([_, str]) => isSumAgg(str))
      .map(([name, str]) => ({
        name,
        type: AggregateType.Sum,
        field: this.getFieldDescriptionByName(getFieldName(str)),
    }));
    return getAggregatedTable(aggDescs, this);
  }
  // #region alias
  public rollup(...args: Parameters<Table['summarize']>) {
    return this.summarize(...args);
  }
  public aggregate(...args: Parameters<Table['summarize']>) {
    return this.summarize(...args);
  }
  // #endregion
}
