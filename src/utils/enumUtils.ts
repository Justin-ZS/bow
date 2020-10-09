import { DataType } from '../typings';

export const getDataType = (value: any) => {
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

