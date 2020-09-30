import { ITable } from './table';

export type OutputTableEx = (table: ITable, limit: number) => unknown;
export type InputTableEx = (data: unknown) => ITable;