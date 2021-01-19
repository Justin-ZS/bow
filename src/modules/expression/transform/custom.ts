import * as ESTree from 'estree';
import { generate } from 'escodegen';
import { instantiate } from 'PureUtils';

import baseTransformers from './base';
import { Transformers, ExpressionType, state } from './constant';
import { predAST, fromAST, makeMemberExpr, makeOpExpr } from './helper';
import { symbolMapping as binaryMapping } from '../../operators/binary';

const fallback = (node, state, t) => {
  const baseT = baseTransformers[node.type];
  return baseT(node, state, t);
};

const operatorTransformers: Transformers<typeof state> = {
  [ExpressionType.Object]: (node, state, t) => {
    if (!predAST.isOperator(node)) return fallback(node, state, t);

    const op = fromAST.operator(node);
    const opStr = generate(makeOpExpr(op));

    state.operatorCollection[opStr] = instantiate(opStr)();

    return makeMemberExpr(state.operatorResults, opStr, true);
  }
};

// 2 * 3 -> op.mul(2, 3);
export const nativeOpTransformers: Transformers<typeof state> = {
  [ExpressionType.Binary]: (node, state, t) => {
    const { operator, left, right } = node as ESTree.BinaryExpression;
    return {
      type: ExpressionType.Call,
      callee: makeMemberExpr(
        state.operatorName,
        binaryMapping[operator],
        true),
      arguments: [left, right],
    } as  ESTree.CallExpression;
  }
};

export default operatorTransformers;