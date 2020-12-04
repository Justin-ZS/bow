import { AggregateType } from 'Typings';
import Op from './Operator';

export const sum = (field: string) => Op.create(AggregateType.Sum, field);

export const average = (field: string) => Op.create(AggregateType.Avg, field);
export const avg = average;
export const mean = average;

export const max = (field: string) => Op.create(AggregateType.Max, field);

export const min = (field: string) => Op.create(AggregateType.Min, field);

export const rowCount = () => Op.create(AggregateType.Count);
export const n = () => rowCount;