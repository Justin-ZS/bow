import { AggregateType, AggregateOp } from 'Typings';

export const makeOp = (
  type: AggregateOp['type'],
  ...fields: AggregateOp['fields']
): AggregateOp => ({ type, fields });

export const sum = (field: string) => makeOp(AggregateType.Sum, field);

export const average = (field: string) => makeOp(AggregateType.Avg, field);
export const avg = average;
export const mean = average;

export const max = (field: string) => makeOp(AggregateType.Max, field);

export const min = (field: string) => makeOp(AggregateType.Min, field);

export const rowCount = () => makeOp(AggregateType.Count);
export const n = rowCount;