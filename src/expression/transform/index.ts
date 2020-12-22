import * as ESTree from 'estree';
import baseTransformers, { RecursiveTransformer } from './base';
import customTransformers from './custom';

const getTransformer = (node: ESTree.Node) => {
  const type = node.type;
  return customTransformers[type] ?? baseTransformers[type] ?? (x => x);
};

const transformAST = <T = unknown>(
  root: ESTree.Node,
  state: T = null,
) => (function t(
  node: ESTree.Node,
  st: T,
) {
  const transformer = getTransformer(node) as RecursiveTransformer<T>;
  return transformer(node, st, t);
})(root, state);


export default transformAST;