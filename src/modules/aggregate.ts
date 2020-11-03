import { ITable, Visitor, TableData, TableMeta, AggregateDescription } from 'Typings';
import { makeFieldDesc } from 'Utils';
import { range } from 'PureUtils';

import { ArrayColumn } from './column';
import { extractGroupedColumns } from './/group';
import { Aggregator, getAggregatorByDescription } from './Aggregator';

const aggregateGroupedTable = (
  aggs: Aggregator[],
  table: ITable,
) => {
  const { size, keys, map, names } = table.groups;

  const groups = range(0, size);
  const aggss = aggs.map(agg => groups.map(() => agg.clone()));
  const visitor: Visitor = (rowIdx) => {
    aggss.forEach(aggs => {
      const agg = aggs[keys[rowIdx]];
      agg.addUp(table.getCell(agg.field.name, rowIdx));
    });
  };
  table.traverse(visitor);

  const data: TableData = {};
  // grouped fields data
  extractGroupedColumns(map)
    .forEach((column, idx) => {
      const name = names[idx];
      data[name] = ArrayColumn.from(column);
    });
  // aggregated values data
  aggs.forEach((agg, idx) => {
    const name = agg.name;
    const colAggs = aggss[idx];
    data[name] = ArrayColumn.from(colAggs.map(agg => agg.value));
  });

  const fieldDescs = names.map(name => table.getFieldDescriptionByName(name));
  const meta: TableMeta = {
    fields: fieldDescs
      .map((f, idx) => makeFieldDesc(f.name, idx, f.type))
      .concat(aggs
        .map((agg, idx) => makeFieldDesc(agg.name, fieldDescs.length + idx, agg.dataType))
      ),
    rowCount: size,
  };

  return table.create(data, meta);
};

const aggregateFlatTable = (
  aggs: Aggregator[],
  table: ITable,
) => {
  const visitor: Visitor = (rowIdx) => {
    aggs.forEach(agg => {
      agg.addUp(table.getCell(agg.field.name, rowIdx));
    });
  };
  table.traverse(visitor);

  const data: TableData = {};
  aggs.forEach(agg => {
    data[agg.name] = ArrayColumn.from([agg.value]);
  });

  const meta: TableMeta = {
    fields: aggs
      .map((agg, idx) => makeFieldDesc(agg.name, idx, agg.dataType)),
    rowCount: 1,
  };

  return table.create(data, meta);
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