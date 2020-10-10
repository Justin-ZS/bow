import { ITable, Visitor } from 'Typings';
import { makeGroupDesc } from 'Utils';

const extractGroupData = (prevData = [], map) => {
  const entries = Array.from(map.entries());
  const results = [];
  entries.forEach(([key, nextMap]) => {
    const curData = prevData.concat(key);
    if (nextMap instanceof Map) {
      return results.push(...extractGroupData(curData, nextMap));
    } else {
      return results.push(curData);
    }
  });
    return results;
};

export const getGroupDesc = (
  names: string[],
  table: ITable,
) => {
  if (!names?.length) return null;

  const keys: number[] = Array(table.totalRowCount);

  let size = 0;
  const map = new Map();
  const getCells = names.map(name => rowIdx => table.getCell(name, rowIdx));
  const visitor: Visitor = (rowIdx) => {
    const groupId = getCells
      .reduce((accMap: Map<any, any>, getVal, idx) => {
        const val = getVal(rowIdx);
        let next = accMap.get(val);
        if (!accMap.has(val)) {
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
  };

  table.traverse(visitor);

  return makeGroupDesc(names, keys, size);
};