import { AggregateType, DataType } from 'Typings';

export abstract class Aggregator {
  type: AggregateType;
  dataType = DataType.Null;

  abstract addUp(getter: () => unknown): void;
  abstract value: number;

  clone(): Aggregator {
    const Ctor = this.constructor as any;
    return new Ctor();
  }
}

class SumAggregator extends Aggregator {
  type = AggregateType.Sum;
  dataType = DataType.Number;

  private sum: number = null;

  addUp(getter) {
    const value = getter();
    if (value == null) return this;

    this.sum += +value; // @TODO: handle type coerce
  }

  get value() {
    return this.sum;
  }
}
class MinAggregator extends Aggregator {
  type = AggregateType.Min;
  dataType = DataType.Number;

  private min: number = null;

  addUp(getter) {
    const value = getter();
    if (value == null) return this;

    if (this.min == null) {
      this.min = value;
    } else {
      this.min = Math.min(this.min, +value); // @TODO: handle type coerce
    }
  }
  get value() {
    return this.min;
  }
}
class MaxAggregator extends Aggregator {
  type = AggregateType.Max;
  dataType = DataType.Number;

  private max: number = null;

  addUp(getter) {
    const value = getter();
    if (value == null) return this;

    if (this.max == null) {
      this.max = value;
    } else {
      this.max = Math.max(this.max, +value); // @TODO: handle type coerce
    }
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

  private sumAgg = new SumAggregator();
  private cntAgg = new CountAggregator();

  addUp(getter) {
    const value = getter();
    this.sumAgg.addUp(value);
    this.cntAgg.addUp();
  }
  get value() {
    const sum = this.sumAgg.value;
    const count = this.cntAgg.value;

    if (count === 0) return null;
    if (sum == null) return null;

    return sum / count;
  }
}

export const aggMapping = {
  [AggregateType.Sum]: SumAggregator,
  [AggregateType.Avg]: AvgAggregator,
  [AggregateType.Count]: CountAggregator,
  [AggregateType.Max]: MaxAggregator,
  [AggregateType.Min]: MinAggregator,
};