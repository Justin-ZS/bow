export interface IColumn<T = any> {
  getDatum: (index: number) => T,
  length: number,
}

export type GroupDescription = {
  names: string[], // grouped field names
  keys: number[], // mapping rowIdx to groupId
  size: number; // group count
}

export type TableData = Record<string, IColumn>;

type Visitor = (rowIdx: number, data: TableData) => void;

export interface ITable {
  traverse: (fn: Visitor) => void;
  getRowByIdx: (rowIdx: number) => unknown[]
  readonly totalRowCount: number;
}