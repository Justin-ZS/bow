import { ITable, FieldDescription } from 'Typings';
import { range, mapRecord } from 'PureUtils';
import { TableEx } from 'Extensions';

import { extractGroupedColumns } from './group';
import { Aggregator, aggMapping } from './Aggregator';

export type AggregatorDescription = {
  name?: string,
  agg: Aggregator,
  getterFn: (rowIdx, table) => () => unknown,
}

const aggregateGroupedTable = (
  descs: Record<string, AggregatorDescription>,
  getValues: Function,
  table: ITable,
) => {
  const { size, keys, map, names } = table.groups;

  const groups = range(0, size);
  const descNames = Object.keys(descs);

  const descss: Record<string, AggregatorDescription[]> = mapRecord(
    desc => groups.map(() =>
      ({ ...desc, agg: desc.agg.clone() })), descs);

  table.traverse((rowIdx) => {
    descNames.forEach(name => {
      const desc = descss[name][keys[rowIdx]];
      desc.agg.addUp(desc.getterFn(rowIdx, table));
    });
  });

  const data = {};
  // grouped fields data
  extractGroupedColumns(map)
    .forEach((column, idx) => data[names[idx]] = column);
  // aggregated values data
  groups.forEach((idx) => {
    const opResults = mapRecord(descList => descList[idx].agg.value, descss);
    const values = getValues(opResults);
    mapRecord((value, name) => {
      data[name] = data[name] ?? [];
      data[name].push(value);
    }, values);
  });

  return TableEx.fromColumns(data);
};

const aggregateFlatTable = (
  descs: Record<string, AggregatorDescription>,
  getValues: Function,
  table: ITable,
) => {
  const descList = Object.values(descs);

  table.traverse((rowIdx) => {
    descList.forEach(desc => {
      desc.agg.addUp(desc.getterFn(rowIdx, table));
    });
  });

  const opResults = mapRecord(desc => desc.agg.value, descs);
  const fulfilled = getValues(opResults);
  const data = mapRecord(v => [v], fulfilled);

  return TableEx.fromColumns(data);
};

export const getAggregatedTable = (
  aggDescs: Record<string, AggregatorDescription>,
  getValues: Function,
  table: ITable,
) => {
  if (table.isGrouped) {
    return aggregateGroupedTable(aggDescs, getValues, table);
  }
  return aggregateFlatTable(aggDescs, getValues, table);
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