import { TableEx } from '../src';
import { getOrderedIndexes } from '../src/modules/order';

describe('Order', () => {
  it('Order numbers: 2, 1, 3', () => {
    const table = TableEx.fromColumns({
      order: [2, 1, 3],
      idx: [0, 1, 2],
    });
    // desc
    expect(getOrderedIndexes((a, b) => b.order - a.order, table)).toEqual([2,0,1]);
    // asc
    expect(getOrderedIndexes((a, b) => a.order - b.order, table)).toEqual([1,0,2]);
  });
});