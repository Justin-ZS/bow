import baseTransformers, { Transformers, ExpressionType } from './base';
import { predAST, fromAST, makeOpExpr } from './helper';

const fallback = (node, state, t) => {
  const baseT = baseTransformers[node.type];
  return baseT(node, state, t);
};

const transformers: Transformers = {
  // ({ type: sum, fields: ['column'] }) -> t => op.sum(t['column'])
  [ExpressionType.Object]: (node, state, t) => {
    if (!predAST.isOperator(node)) return fallback(node, state, t);
    const op = fromAST.operator(node);
    return makeOpExpr(op);
  }
};

export default transformers;