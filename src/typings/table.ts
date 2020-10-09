import { DataType } from './enums';
import { Predicate } from './common';

export interface IColumn<T = unknown> {
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

export type IndexSet = Set<number>;

export type TableData = Record<string, IColumn>;

export type Visitor = (rowIdx: number, done: () => void) => void;

export interface ITable {
  traverse: (fn: Visitor) => void;
  getCell: (colName: string, rowIdx: number) => unknown;
  getRowByIdx: (rowIdx: number) => unknown[];

  groupBy: (...names: string[]) => ITable,
  filterBy: (pred: Predicate) => ITable,
  
  readonly [Symbol.toStringTag]: string;
  readonly fields: FieldDescription[];
  readonly totalRowCount: number;
  readonly rowCount: number;
}