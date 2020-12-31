import { instantiate } from 'PureUtils';
import { generate } from 'escodegen';

import baseTransformers from './base';
import { Transformers, ExpressionType, state } from './constant';
import { predAST, fromAST, makeMemberExpr, makeOpExpr } from './helper';

const fallback = (node, state, t) => {
  const baseT = baseTransformers[node.type];
  return baseT(node, state, t);
};

const transformers: Transformers<typeof state> = {
  [ExpressionType.Object]: (node, state, t) => {
    if (!predAST.isOperator(node)) return fallback(node, state, t);

    const op = fromAST.operator(node);
    const opExpr = makeOpExpr(op);
    const opStr = generate(opExpr);

    state.operatorCollection[opStr] = instantiate(opStr)();

    return makeMemberExpr(state.operatorResultProvider, opStr, true);
  }
};

export default transformers;