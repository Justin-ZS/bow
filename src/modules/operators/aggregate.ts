import { AggregateType } from 'Typings';
import { makeOperator } from 'CommonUtils';

export const sum = (field: string) => makeOperator(AggregateType.Sum, field);

export const average = (field: string) => makeOperator(AggregateType.Avg, field);
export const avg = average;
export const mean = average;

export const max = (field: string) => makeOperator(AggregateType.Max, field);

export const min = (field: string) => makeOperator(AggregateType.Min, field);

export const rowCount = () => makeOperator(AggregateType.Count);
export const n = rowCount;