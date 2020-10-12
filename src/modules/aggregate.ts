import {
  ITable, Visitor, AggregateType, FieldDescription,
  DataType, TableData, TableMeta, AggregateDescription,
} from 'Typings';
import { makeFieldDesc } from 'Utils';
import { range } from 'PureUtils';

import { ArrayColumn } from './column';
import { extractGroupedColumns } from './/group';

// #region aggregators
abstract class Aggregator {
  readonly field: FieldDescription;
  readonly name: string;

  type: AggregateType;
  dataType = DataType.Null;

  constructor(targetField: FieldDescription, name: string) {
    this.field = targetField;
    this.name = name;
  }

  abstract addUp(value: unknown): Aggregator;
  abstract get value(): unknown;
  clone(): Aggregator {
    const Ctor = this.constructor as any;
    return new Ctor(this.field, this, name);
  }
}

class SumAggregator extends Aggregator {
  type = AggregateType.Sum;
  dataType = DataType.Number;
  private sum: number = null;

  addUp(value: number) {
    if (value == null) return this;

    this.sum += +value; // @TODO: handle type coerce
    return this;
  }
  get value() {
    return this.sum;
  }
}
class MinAggregator extends Aggregator {
  type = AggregateType.Min;
  dataType = DataType.Number;
  private min: number = null;

  addUp(value: number) {
    if (value == null) return this;

    if (this.min == null) {
      this.min = value;
    } else {
      this.min = Math.min(this.min, +value); // @TODO: handle type coerce
    }

    return this;
  }
  get value() {
    return this.min;
  }
}
class MaxAggregator extends Aggregator {
  type = AggregateType.Max;
  dataType = DataType.Number;
  private max: number = null;

  addUp(value: number) {
    if (value == null) return this;

    if (this.max == null) {
      this.max = value;
    } else {
      this.max = Math.max(this.max, +value); // @TODO: handle type coerce
    }

    return this;
  }
  get value() {
    return this.max;
  }
}
class CountAggregator extends Aggregator {
  type = AggregateType.Count;
  dataType = DataType.Number;
  private count = 0;

  addUp() {
    this.count++;
    return this;
  }
  get value() {
    return this.count;
  }
}
class AvgAggregator extends Aggregator {
  type = AggregateType.Avg;
  dataType = DataType.Number;
  private sumAgg = new SumAggregator(this.field, this.name);
  private cntAgg = new CountAggregator(this.field, this.name);

  addUp(value: number) {
    this.sumAgg.addUp(value);
    this.cntAgg.addUp();

    return this;
  }
  get value() {
    const sum = this.sumAgg.value;
    const count = this.cntAgg.value;

    if (count === 0) return null;
    if (sum == null) return null;

    return sum / count;
  }
}

const getAggregatorByDescription = (aggDesc: AggregateDescription): Aggregator => {
  switch (aggDesc.type) {
    case AggregateType.Sum:
      return new SumAggregator(aggDesc.field, aggDesc.name);
    case AggregateType.Min:
      return new MinAggregator(aggDesc.field, aggDesc.name);
    case AggregateType.Max:
      return new MaxAggregator(aggDesc.field, aggDesc.name);
    case AggregateType.Count:
      return new CountAggregator(aggDesc.field, aggDesc.name);
    case AggregateType.Avg:
      return new AvgAggregator(aggDesc.field, aggDesc.name);
    default:
      throw Error(`Not Supported Aggregate Type: ${aggDesc.type}`);
  }
};
// #endregion

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
    fieldDescs: fieldDescs
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
    fieldDescs: aggs
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