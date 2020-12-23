import * as ESTree from 'estree';
import baseTransformers, { RecursiveTransformer } from './base';
import customTransformers from './custom';

const getTransformer = (node: ESTree.Node, custom) => {
  const type = node.type;
  return custom[type] ?? baseTransformers[type] ?? (x => x);
};

const transformAST = <T = unknown>(
  root: ESTree.Node,
  state: T = null,
  customTs = customTransformers,
) => (function t(
  node: ESTree.Node,
  st: T,
) {
  const transformer = getTransformer(node, customTs) as RecursiveTransformer<T>;
  return transformer(node, st, t);
})(root, state);


export default transformAST;