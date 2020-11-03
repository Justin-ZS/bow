import { DataType } from './enums';
import { Predicate, Comparator } from './common';

export interface IColumn<T = unknown> {
  getDatum: (index: number) => T,
  length: number,
}

export type FieldDescription = {
  name: string,
  idx: number,
  type: DataType;
}

type GroupMap = Map<unknown, GroupMap | number>

export type GroupDescription = {
  names: string[], // grouped field names
  keys: number[], // mapping rowIdx to groupId
  size: number; // group count
  map: GroupMap; // map for grouped data and groupId
}

export type IndexSet = Set<number>;

export type TableData = Record<string, IColumn>;

export type TableMeta = {
  fieldDescs: FieldDescription[],
  rowCount: number,
}

export type TableDescription = {
  data?: TableData;
  meta?: TableMeta;
  filterBy?: IndexSet;
  groupBy?: GroupDescription;
  orderBy?: Comparator;
}

export type Visitor = (rowIdx: number, done: () => void) => void;

export interface ITable {
  traverse: (fn: Visitor, noOrder?: boolean) => void;
  clone: (tableDesc: TableDescription) => ITable;
  create: (
    data?: TableData,
    meta?: TableMeta,
    filterBy?: IndexSet,
    groupBy?: GroupDescription,
    orderBy?: Comparator,
  ) => ITable;
  getFieldDescriptionByName: (colName: string) => FieldDescription;

  getCell: (colName: string, rowIdx: number) => unknown;
  getRowDataByIdx: (rowIdx: number) => Record<string, unknown>;

  groupBy: (...names: string[]) => ITable,
  filterBy: (pred: Predicate) => ITable,
  
  readonly [Symbol.toStringTag]: string;
  readonly fields: FieldDescription[];
  readonly totalRowCount: number;
  readonly rowCount: number;
  readonly isGrouped: boolean;
  readonly groups: GroupDescription;
}