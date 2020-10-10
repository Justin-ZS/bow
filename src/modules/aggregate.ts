import {
  ITable, Visitor, AggregateType, FieldDescription,
  DataType, TableData, TableMeta, AggregateDescription,
} from 'Typings';
import { once } from 'PureUtils';
import { ArrayColumn } from './column';

abstract class Aggregator {
  readonly type: AggregateType;
  readonly field: FieldDescription;
  readonly name: string;
  dataType = DataType.Null;

  constructor(targetField: FieldDescription, name: string) {
    this.field = targetField;
    this.name = name;
  }

  abstract init(): void;
  abstract addUp(value: unknown): Aggregator;
  abstract get value(): unknown;
}

class SumAggregator extends Aggregator {
  type = AggregateType.Sum;

  private sum: number;
  init() {
    this.sum = 0;
    this.dataType = DataType.Number;
  }
  addUp(value: number) {
    this.sum += +value; // @TODO: handle type coerce
    return this;
  }
  get value() {
    return this.sum;
  }
}

const getAggregatorByDescription = (aggDesc: AggregateDescription): Aggregator => {
  switch (aggDesc.type) {
    case AggregateType.Sum:
      return new SumAggregator(aggDesc.field, aggDesc.name);
    default:
      throw Error(`Not Supported Aggregate Type: ${aggDesc.type}`);
  }
};

export const getAggregatedTable = (
  aggDescs: AggregateDescription[],
  table: ITable,
) => {
  const aggs = aggDescs.map(getAggregatorByDescription);
  const initOnce = once(() => aggs.forEach(agg => agg.init()));

  const visitor: Visitor = (rowIdx) => {
    initOnce();
    aggs.forEach(agg => agg.addUp(table.getCell(agg.field.name, rowIdx)));
  };
  table.traverse(visitor);

  const data: TableData = aggs.reduce((acc, agg) => {
    acc[agg.name] = ArrayColumn.from([agg.value]);
    return acc;
  }, {});

  const meta: TableMeta = {
    fieldDescs: aggs.map((agg, idx) => ({
      name: agg.name,
      type: agg.dataType,
      idx,
    })),
    rowCount: 1,
  };
  
  return table.create(data, meta);
};