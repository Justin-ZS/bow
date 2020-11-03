import { DataType } from '../typings';

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

