import { ITable } from 'Typings';

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
