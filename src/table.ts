import { DataType } from './typings';
import { getDataType } from './helpers';
import { ArrayColumn, IColumn } from './column';

type FieldDescription = {
  name: string,
  idx: number,
  type: DataType;
}

const makeFieldDesc = (
  name: string,
  idx: number,
  type: DataType
): FieldDescription =>
  ({ name, idx, type });


type ColumnsTable = {
  [fieldName: string]: any[],
}

type Comparator = (a, b) => number;
type GroupDescription = {
  names: string[],
  get: Function[],
}

export default class Table {
  private data: { [fieldName: string]: IColumn };

  private filterBy;
  private groupBy;
  private orderBy: Comparator;

  private readonly fields: FieldDescription[];
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
    data,
    meta: {
      fieldDescs: FieldDescription[],
      rowCount: number,
    },
    filter?,
    groupDesc?: GroupDescription,
    order?
  ) {
    this.data = data;

    this.fields = meta.fieldDescs;
    this.totalRowCount = meta.rowCount;

    this.filterBy = filter ?? null;
    this.groupBy = groupDesc ?? null;
    this.orderBy = order ?? null;

  }

  // #region getter
  get isFiltered() {
    return !!this.filterBy;
  }
  get isOrdered() {
    return !!this.orderBy;
  }
  get rowCount() {
    return this.isFiltered
      ? this.filterBy.count()
      : this.totalRowCount;
  }
  get colCount() {
    return this.fields.length;
  }
  get columns() {
    return this.data;
  }
  // #endregion

  // #region overwrite native api
  get [Symbol.toStringTag]() {
    if (!this.fields) return 'Object'; // bail if called on prototype
    const nr = this.rowCount + ' row' + (this.rowCount !== 1 ? 's' : '');
    const nc = this.colCount + ' col' + (this.colCount !== 1 ? 's' : '');
    return `Table: ${nc} x ${nr}`
      + (this.isFiltered ? ` (${this.totalRowCount} backing)` : '')
      // + (this.isGroupedrowCount() ? `, ${this._group.size} groups` : '')
      + (this.isOrdered ? ', ordered' : '');
  }
  // #endregion

  clone({ filterBy, groupBy, orderBy }) {
    return Table.create(
      this.data,
      {
        fieldDescs: this.fields,
        rowCount: this.totalRowCount,
      },
      filterBy ?? this.filterBy,
      groupBy ?? this.groupBy,
      orderBy ?? this.orderBy
    );
  }

  getColumnByName(colName: string) {
    return this.data[colName];
  }
  getColumnByIdx(colIdx: number) {
    if (colIdx < 0 || colIdx >= this.fields.length) {
      throw Error('Index over Range');
    }
    return this.data[this.fields[colIdx].name];
  }
  getCell(colName: string, rowIdx: number) {
    return this.getColumnByName(colName).getDatum(rowIdx);
  }
}