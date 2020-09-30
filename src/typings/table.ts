import { DataType } from './enums';

export interface IColumn<T = any> {
  getDatum: (index: number) => T,
  length: number,
}

export type FieldDescription = {
  name: string,
  idx: number,
  type: DataType;
}

export type GroupDescription = {
  names: string[], // grouped field names
  keys: number[], // mapping rowIdx to groupId
  size: number; // group count
}

export type TableData = Record<string, IColumn>;

type Visitor = (rowIdx: number, done: () => void) => void;

export interface ITable {
  traverse: (fn: Visitor) => void;
  getCell: (colName: string, rowIdx: number) => unknown;
  
  readonly [Symbol.toStringTag]: string;
  readonly fields: FieldDescription[];
  readonly totalRowCount: number;
  readonly rowCount: number;
}