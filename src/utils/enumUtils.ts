import { DataType, AggregateType } from 'Typings';
import { isFn } from './pureUtils';

export const inferDataType = (value: unknown): DataType => {
  switch (typeof value) {
    case 'string':
      return DataType.String;
    case 'number':
      return DataType.Number;
    case 'boolean':
      return DataType.Boolean;
    default:
      return DataType.Unknown;
  }
};

export const pred = {
  isAggregate: isFn('type', Object.values(AggregateType)),
};
