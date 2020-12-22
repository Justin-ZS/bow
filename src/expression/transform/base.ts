import * as ESTree from 'estree';

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
//#region base transformers
const listT = (nodes, state, t) => {
  let isChanged = false;
  const newNodes = nodes
    .map(node => {
      const newNode = t(node, state);
      if (newNode !== node) isChanged = true;
      return newNode;
    });
  return isChanged ? newNodes : nodes;
};
const ifElseT = (pred, t1, t2) => (...args) => pred(...args) ? t1(...args) : t2(...args);
const propT = (propName) =>
  (node, state, t) => {
    const propNode = node[propName];
    if (!propNode) return node;

    const transform = Array.isArray(propNode) ? listT : t;
    const newProp = transform(propNode, state, t);

    if (newProp === propNode) return node;
    return { ...node, [propName]: newProp };
  };
const propsT = (...propNames) =>
  (node, state, t) =>
    propNames
      .reduce((newNode, propName) => propT(propName)(newNode, state, t), node);
//#endregion
// https://github.com/estree/estree/blob/master/es5.md#unary-operations
const unary = propT('argument');
// https://github.com/estree/estree/blob/master/es5.md#binary-operations
const binary = propsT('left', 'right');
// ConditionalExpression
// IfStatement
const ternary = propsT('test', 'consequent', 'alternate');

const func = propsT('params', 'body');
const call = propsT('callee', 'arguments');
const props = propT('properties');
const list = propT('elements');

const ignore = node => node;

const transformers: Transformers = {
  'Identifier': ignore,
  'Literal': ignore,
  'Property': ifElseT(node => node.computed, propsT('key', 'value'), propT('value')),

  'TemplateElement': ignore,
  'TemplateLiteral': propsT('expressions', 'elements'),
  'TaggedTemplateExpression': propsT('tag', 'quasi'),

  'ObjectPattern': props,
  'ArrayPattern': list,
  'RestElement': unary,
  'AssignmentPattern': binary,

  [ExpressionType.Array]: list,
  [ExpressionType.Object]: props,
  [ExpressionType.Function]: func,
  [ExpressionType.Unary]: unary,
  [ExpressionType.Update]: unary,
  [ExpressionType.Binary]: binary,
  [ExpressionType.Assignment]: binary,
  [ExpressionType.Logical]: binary,
  [ExpressionType.Member]: ifElseT(node => node.computed, propsT('object', 'property'), propT('object')),
  [ExpressionType.Member]: ternary,
  [ExpressionType.Call]: call,
  [ExpressionType.New]: call,
  [ExpressionType.Sequence]: propT('expressions'),
  [ExpressionType.ArrowFunction]: func,
};

export default transformers;
