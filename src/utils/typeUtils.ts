import { GroupDescription, FieldDescription, DataType } from 'Typings';

export const makeGroupDesc = (
  names: GroupDescription['names'],
  keys: GroupDescription['keys'],
  size: GroupDescription['size'],
  map: GroupDescription['map'],
): GroupDescription => ({ names, keys, size, map });

export const makeFieldDesc = (
  name: string,
  idx: number,
  type: DataType
): FieldDescription =>
  ({ name, idx, type });
