import { GroupDescription } from 'Typings';

export const makeGroupDesc = (
  names: GroupDescription['names'],
  keys: GroupDescription['keys'],
  size: GroupDescription['size'],
): GroupDescription => ({ names, keys, size });