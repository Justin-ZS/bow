import { TableEx } from '../src';
import { getIndexSet } from '../src/modules/filter';

describe('Filter', () => {
  it('Filter numbers: 1,2,3', () => {
    const table = TableEx.fromColumns({
      val: [1,2,3],
      idx: [0, 1, 2],
    });
    // remove idx 1
    expect(getIndexSet((d: any) => d.val !== 1, table).has(0)).toBeFalsy;
    expect(getIndexSet((d: any) => d.val !== 1, table).has(1)).toBeTruthy;
    expect(getIndexSet((d: any) => d.val !== 1, table).has(2)).toBeTruthy;

    // keep idx 2
    expect(getIndexSet((d: any) => d.val === 3, table).has(0)).toBeFalsy;
    expect(getIndexSet((d: any) => d.val === 3, table).has(1)).toBeFalsy;
    expect(getIndexSet((d: any) => d.val === 3, table).has(2)).toBeTruthy;
  });
});