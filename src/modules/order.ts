import { ITable } from 'Typings';
import { Comparator } from 'CommonTypings';

export const getOrderedIndexes = (
  comparator: Comparator,
  table: ITable,
) => {
  const indexes = [];
  table.traverse(rowIdx => indexes.push(rowIdx), true);

  const dataMap = new Map();
  const getData = (idx) => {
    if (!dataMap.has(idx)) {
      dataMap.set(idx, table.getRowDataByIdx(idx));
    }
    return dataMap.get(idx);
  };

  return indexes
    .sort((idx1, idx2) => comparator(getData(idx1), getData(idx2)));
};
