import * as ESTree from 'estree';
import { state } from './constant';
import baseTransformers from './base';
import customTransformers from './custom';

const getTransformer = (node: ESTree.Node, custom) => {
  const type = node.type;
  return custom[type] ?? baseTransformers[type] ?? (x => x);
};

const transformAST = (
  root: ESTree.Node,
  customState: Partial<typeof state> = {},
  customTs = customTransformers,
) => (function t(node, st) {
  const transformer = getTransformer(node, customTs);
  return transformer(node, st, t);
})(root, { ...state, ...customState });


export default transformAST;
export * from './constant';