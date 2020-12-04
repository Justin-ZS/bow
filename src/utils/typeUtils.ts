import { GroupDescription, FieldDescription, DataType } from 'Typings';

export const makeGroupDesc = (
  names: string[],
  keys: IndexArr,
  size: number,
  map: GroupDescription['map'],
): GroupDescription => ({ names, keys, size, map });

export const makeFieldDesc = (
  name: string,
  idx: number,
  type: DataType,
): FieldDescription => ({ name, idx, type });
