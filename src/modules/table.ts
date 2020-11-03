import {
  ITable, TableData, GroupDescription, FieldDescription,
  TableDescription, AggregateDescription, AggregateType,
} from 'Typings';
import { pick } from 'PureUtils';

import { getGroupDesc } from './group';
import { getIndexSet } from './filter';
import { getOrderedIndexes } from './order';
import { getAggregatedTable } from './aggregate';

export default class Table implements ITable {
  private readonly data: TableData;
  
  private readonly _fieldDescs: FieldDescription[];
  private readonly _groupDescs: GroupDescription;

  private readonly _visibleIndexSet: IndexSet;
  private readonly _orderedIndexes: IndexArr;

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
      fields: FieldDescription[],
      rowCount: number,
    },
    filteredSet?: IndexSet,
    groupDesc?: GroupDescription,
    orderedIndexes?: IndexArr,
  ) {
    this.data = data;

    this._fieldDescs = meta.fields;
    this.totalRowCount = meta.rowCount;

    this._visibleIndexSet = filteredSet ?? null;
    this._groupDescs = groupDesc ?? null;
    this._orderedIndexes = orderedIndexes ?? null;
  }

  // #region getter
  get isFiltered() {
    return !!this._visibleIndexSet;
  }
  get isGrouped() {
    return !!this._groupDescs;
  }
  get isOrdered() {
    return !!this._orderedIndexes;
  }

  get rowCount() {
    return this.isFiltered
      ? this._visibleIndexSet.size
      : this.totalRowCount;
  }
  get colCount() {
    return this._fieldDescs.length;
  }

  get columns() {
    return this.data;
  }
  get groups() {
    return this._groupDescs;
  }
  get fields() {
    return this._fieldDescs;
  }
  // #endregion

  // #region overwrite native api
  get [Symbol.toStringTag]() {
    if (!this._fieldDescs) return 'Object'; // bail if called on prototype
    const nr = this.rowCount + ' row' + (this.rowCount !== 1 ? 's' : '');
    const nc = this.colCount + ' col' + (this.colCount !== 1 ? 's' : '');
    return `Table: ${nc} x ${nr}`
      + (this.isFiltered ? ` (${this.totalRowCount} backing)` : '')
      + (this.isGrouped ? `, ${this._groupDescs.size} groups` : '')
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

  public traverse(fn, noOrder = false) {
    let rowIdx = 0;
    let isDone = false;
    const done = () => isDone = true;
    const exec = (rowIdx) => isDone || fn(rowIdx, this.data, done);

    if (!noOrder && this.isOrdered) {
      this._orderedIndexes.forEach(exec);
      return;
    }

    if (this.isFiltered) {
      this._visibleIndexSet.forEach(exec);
      return;
    }

    while (!isDone && rowIdx < this.totalRowCount) {
      exec(rowIdx);
      rowIdx += 1;
    }
  }
  public clone({ data, meta, filterBy, groupBy, orderBy }: TableDescription) {
    return Table.create(
      data ?? this.data,
      {
        fields: meta?.fields ?? this._fieldDescs,
        rowCount: meta?.rowCount ?? this.totalRowCount,
      },
      filterBy ?? this._visibleIndexSet,
      groupBy ?? this._groupDescs,
      orderBy ?? this._orderedIndexes
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
    return this.data[this._fieldDescs[colIdx].name];
  }
  public getCell(colName: string, rowIdx: number) {
    return this.getColumnByName(colName).getDatum(rowIdx);
  }
  public getRowByIdx(rowIdx: number) {
    this.checkRowIdxOverRange(rowIdx);
    return this.fields.map(f => this.data[f.name].getDatum(rowIdx));
  }
  public getRowDataByIdx(rowIdx: number): Record<string, unknown> {
    const row = this.getRowByIdx(rowIdx);
    const data = {};
    this.fields.forEach((f, idx) => data[f.name] = row[idx]);
    return data;
  }
  public extractColumnsByNames(colNames: string[]) {
    const columns = pick(colNames, this.data);
    const fieldDescs = this.fields.filter(fd => colNames.includes(fd.name));

    return this.clone({
      data: columns,
      meta: {
        fields: fieldDescs,
        rowCount: this.totalRowCount,
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
    // create a new filter index set on current table
    // as a result, we can apply multiple filters one by one
    return this.clone({ filterBy: getIndexSet(filterPred, this) });
  }
  // TODO: use expression in parameters
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
  public orderBy(comparator: Comparator) {
    return this.clone({ orderBy: getOrderedIndexes(comparator, this) });
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
