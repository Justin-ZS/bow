import { ITable, IndexSet } from 'Typings';
import { Predicate } from 'CommonTypings';

export const getIndexSet = (
  predicate: Predicate,
  table: ITable,
) => {
  const filterSet: IndexSet = new Set();
  table.traverse((rowIdx) => {
    if (predicate(table.getRowDataByIdx(rowIdx))) {
      filterSet.add(rowIdx);
    }
  });
  return filterSet;
};
