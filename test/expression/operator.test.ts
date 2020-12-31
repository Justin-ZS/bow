import * as op from '../../src/modules/operators';
import { resolveExpr } from '../../src/modules/expression';

describe('Operator', () => {
  it('Flow', () => {
    const expr = i => i;
    const { ops, getter } = resolveExpr(expr);
    expect(ops).toEqual({});
    expect(getter()).not.toEqual(expr);
    expect(getter()(1)).toEqual(1);
  });
  it("SUM", () => {
    const expr = op.sum('price');
    const { ops, getter } = resolveExpr(expr);

    expect(Object.keys(ops).length).toBe(1);
    expect(getter({ "(t, op) => op.sum(t['price'])": 1 })).toBe(1);
  });
});