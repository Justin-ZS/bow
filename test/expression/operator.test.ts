import * as op from '../../src/modules/operators';
import exprResolver from '../../src/expression';

describe('Operator', () => {
  it('Flow', () => {
    const expr = i => i;
    const resolved = exprResolver(expr);
    expect(resolved).toBeInstanceOf(Function);
    expect(resolved).not.toEqual(expr);
    expect(resolved(1)).toEqual(1);
  });
  it("SUM", () => {
    const expr = op.sum('price');
    const resolved = exprResolver(expr);
    expect(resolved).toBeInstanceOf(Function);
    expect(resolved).not.toEqual(expr);
    expect(`${resolved}`).toEqual("(t, op) => op.sum(t['price'])");
  });
});