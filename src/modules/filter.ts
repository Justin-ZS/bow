import { ITable, IndexSet, Visitor } from 'Typings';
import { Predicate } from 'CommonTypings';

export const getIndexSet = (
  predicate: Predicate,
  table: ITable,
) => {
  const filterSet: IndexSet = new Set();
  const visitor: Visitor = (rowIdx) => {
    const row = table.getRowByIdx(rowIdx);
    const data = {};
    table.fields.forEach((f, idx) => data[f.name] = row[idx]);

    if (predicate(data)) filterSet.add(rowIdx);
  };

  table.traverse(visitor);
  return filterSet;
};
