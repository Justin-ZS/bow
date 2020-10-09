import { GroupDescription, FieldDescription, DataType } from 'Typings';

export const makeGroupDesc = (
  names: GroupDescription['names'],
  keys: GroupDescription['keys'],
  size: GroupDescription['size'],
): GroupDescription => ({ names, keys, size });

export const makeFieldDesc = (
  name: string,
  idx: number,
  type: DataType
): FieldDescription =>
  ({ name, idx, type });
