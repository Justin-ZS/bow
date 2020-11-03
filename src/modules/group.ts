import { ITable, Visitor } from 'Typings';
import { makeGroupDesc } from 'Utils';
import { range } from 'PureUtils';

export const extractGroupedColumns = (
  map,
  idx = 0,
  columns = [],
) => {
  const entries = Array.from(map.entries());
  if (entries.length === 0) return columns;

  const column = columns[idx] = columns[idx] ?? [];
  entries.forEach(([key, nextMap]) => {
    if (nextMap instanceof Map) {
      const nextIdx = idx + 1;
      extractGroupedColumns(nextMap, nextIdx, columns);

      const nextColumn = columns[nextIdx];
      range(column.length, nextColumn.length)
        .forEach(() => column.push(key));
    } else {
      column.push(key);
    }
  });
  return columns;
};


export const getGroupDesc = (
  names: string[],
  table: ITable,
) => {
  if (!names?.length) return null;

  const keys: IndexArr = Array(table.totalRowCount);

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
  return makeGroupDesc(names, keys, size, map);
};