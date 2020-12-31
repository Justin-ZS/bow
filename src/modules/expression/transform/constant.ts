import * as ESTree from 'estree';

export enum SimpleType {
  Literal = 'Literal',
  Identifier = 'Identifier',
  Property = 'Property',
}
export enum ElementType {
  Spread = 'Spread',
}

export enum ExpressionType {
  // es5 https://github.com/estree/estree/blob/master/es5.md
  Array = 'ArrayExpression',
  Object = 'ObjectExpression',
  Function = 'FunctionExpression',
  Unary = 'UnaryExpression',
  Update = 'UpdateExpression',
  Binary = 'BinaryExpression',
  Assignment = 'AssignmentExpression',
  Logical = 'LogicalExpression',
  Member = 'MemberExpression',
  Conditional = 'ConditionalExpression',
  Call = 'CallExpression',
  New = 'NewExpression',
  Sequence = 'SequenceExpression',
  // es2015 https://github.com/estree/estree/blob/master/es2015.md
  ArrowFunction = 'ArrowFunctionExpression',
}

export type RecursiveTransformer<T = unknown> = (
  node: ESTree.Node,
  state: T,
  t: RecursiveTransformer<T>,
) => ESTree.Node;

export type Transformers<T = unknown> = {
  [type: string]: RecursiveTransformer<T>
};

export const state = {
  operatorResultProvider: '_ops',
  operatorCollection: {},
};