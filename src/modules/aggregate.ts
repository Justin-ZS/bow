import { ITable, AggregateDescription } from 'Typings';
import { range } from 'PureUtils';
import { TableEx } from 'Extensions';

import { extractGroupedColumns } from './/group';
import { Aggregator, getAggregatorByDescription } from './Aggregator';

const aggregateGroupedTable = (
  aggs: Aggregator[],
  table: ITable,
) => {
  const { size, keys, map, names } = table.groups;

  const groups = range(0, size);
  const aggss = aggs.map(agg => groups.map(() => agg.clone()));

  table.traverse((rowIdx) => {
    aggss.forEach(aggs => {
      const agg = aggs[keys[rowIdx]];
      agg.addUp(table.getCell(agg.field.name, rowIdx));
    });
  });

  const data = {};
  // grouped fields data
  extractGroupedColumns(map)
    .forEach((column, idx) => {
      data[names[idx]] = column;
    });
  // aggregated values data
  aggs.forEach((agg, idx) => {
    data[agg.name] = aggss[idx].map(agg => agg.value);
  });

  return TableEx.fromColumns(data);
};

const aggregateFlatTable = (
  aggs: Aggregator[],
  table: ITable,
) => {
  table.traverse((rowIdx) => {
    aggs.forEach(agg => {
      agg.addUp(table.getCell(agg.field.name, rowIdx));
    });
  });

  const data = aggs
    .reduce((acc, agg) => {
      acc[agg.name] = [agg.value];
      return acc;
    }, {});

  return TableEx.fromColumns(data);
};

export const getAggregatedTable = (
  aggDescs: AggregateDescription[],
  table: ITable,
) => {
  const aggs = aggDescs.map(getAggregatorByDescription);

  if (table.isGrouped) {
    return aggregateGroupedTable(aggs, table);
  }
  return aggregateFlatTable(aggs, table);
};