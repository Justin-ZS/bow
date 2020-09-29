import { ITable } from 'Typings';
import { makeGroupDesc } from 'Helpers';

export const getGroupDesc = (
  table: ITable,
  names: string[],
) => {
  if (!names?.length) return null;

  const keys: number[] = Array(table.totalRowCount);

  let size = 0;
  const map = new Map();
  table.traverse((rowIdx) => {
    const groupId = table.getRowByIdx(rowIdx)
      .reduce((accMap: Map<any, any>, val, idx) => {
        let next = accMap.get(val);
        if (!next) {
          if (idx === names.length - 1) {
            next = size;
            size += 1;
          } else {
            next = new Map();
          }
          accMap.set(val, next);
        }
        return next;
      }, map) as number;
    keys[rowIdx] = groupId;
  });

  return makeGroupDesc(names, keys, size);
};