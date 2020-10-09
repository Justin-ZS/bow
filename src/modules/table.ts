import { ITable, TableData, GroupDescription, FieldDescription } from 'Typings';
import { getDataType, makeFieldDesc } from 'Utils';
import { pick } from 'PureUtils';

import { ArrayColumn } from './column';
import { getGroupDesc } from './groupBy';

type ColumnsTable = Record<string, unknown[]>

type Comparator = (a, b) => number;

export default class Table implements ITable {
  private readonly data: TableData;

  private readonly _filterBy;
  private readonly _groups: GroupDescription;
  private readonly _orderBy: Comparator;

  private readonly _fields: FieldDescription[];
  public readonly totalRowCount;

  // #region static methods
  static fromColumns(columns: ColumnsTable) {
    const data = Object.entries(columns)
      .reduce((acc, [key, value]) => {
        acc[key] = ArrayColumn.from(value);
        return acc;
      }, {});

    const fieldDescs = Object.keys(columns)
      .map((name, idx) =>
        makeFieldDesc(name, idx, getDataType(columns[name][0])));

    const fstField = fieldDescs[0];
    const rowCount = fstField
      ? columns[fstField.name].length
      : 0;

    return Table.create(data, { fieldDescs, rowCount });
  }

  static create(...args: ConstructorParameters<typeof Table>) {
    return new Table(...args);
  }
  // #endregion

  constructor(
    data: TableData,
    meta: {
      fieldDescs: FieldDescription[],
      rowCount: number,
    },
    filter?,
    groupDesc?: GroupDescription,
    order?
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
      ? this._filterBy.count()
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

  public clone({ data, meta, filterBy, groupBy, orderBy }: {
    data?: TableData,
    meta?: any,
    filterBy?: any,
    groupBy?: GroupDescription,
    orderBy?: Comparator,
  }) {
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

  public groupBy(...names) {
    return this.clone({ groupBy: getGroupDesc(this, names) });
  }

  public traverse(fn) {
    let idx = 0;
    let end = this.totalRowCount;
    const done = () => end = idx;

    while (idx < end) {
      fn(idx, this.data, done);
      idx += 1;
    }
  }
}
