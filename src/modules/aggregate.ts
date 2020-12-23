import { ITable, FieldDescription } from 'Typings';
import { range, mapRecord } from 'PureUtils';
import { TableEx } from 'Extensions';

import { extractGroupedColumns } from './group';
import { Aggregator, aggMapping  } from './Aggregator';

export type AggregatorDescription = {
  name?: string,
  agg: Aggregator,
  getterFn: (rowIdx, table) => () => unknown,
}

const aggregateGroupedTable = (
  descs: AggregatorDescription[],
  table: ITable,
) => {
  const { size, keys, map, names } = table.groups;

  const groups = range(0, size);
  const descss: AggregatorDescription[][] = descs
    .map(desc => groups
      .map(() => ({
        ...desc,
        agg: desc.agg.clone(),
      })));

  table.traverse((rowIdx) => {
    descss.forEach(descs => {
      const desc = descs[keys[rowIdx]];
      desc.agg.addUp(desc.getterFn(rowIdx, table));
    });
  });

  const data = {};
  // grouped fields data
  extractGroupedColumns(map)
    .forEach((column, idx) => {
      data[names[idx]] = column;
    });
  // aggregated values data
  descs.forEach((desc, idx) => {
    data[desc.name] = descss[idx].map(({ agg }) => agg.value);
  });

  return TableEx.fromColumns(data);
};

const aggregateFlatTable = (
  descs: AggregatorDescription[],
  table: ITable,
) => {
  table.traverse((rowIdx) => {
    descs.forEach(desc => {
      desc.agg.addUp(desc.getterFn(rowIdx, table));
    });
  });

  const data = descs
    .reduce((acc, { name, agg }) => {
      acc[name] = [agg.value];
      return acc;
    }, {});

  return TableEx.fromColumns(data);
};

export const getAggregatedTable = (
  aggDescs: AggregatorDescription[],
  table: ITable,
) => {
  if (table.isGrouped) {
    return aggregateGroupedTable(aggDescs, table);
  }
  return aggregateFlatTable(aggDescs, table);
};

const fields2GetterFn = (fields: FieldDescription[]) =>
  (rowIdx: number, table: ITable) =>
    () => (fields.length === 1
      ? table.getCell(fields[0].name, rowIdx)
      : fields.map(({ name }) => table.getCell(name, rowIdx)));

export const aggOps = mapRecord((Agg) =>
  (...fields: FieldDescription[]): AggregatorDescription => ({
    agg: new Agg(),
    getterFn: fields2GetterFn(fields),
  }), aggMapping);