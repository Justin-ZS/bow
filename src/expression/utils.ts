import * as ESTree from 'estree';
import * as walker from  'acorn-walk';
import { pred } from 'Utils';
import { Operator } from 'Typings';
import { isFn } from 'PureUtils';

enum SimpleType {
  Literal = 'Literal',
}
enum ExpressionType {
  Object = 'ObjectExpression',
  Array = 'ArrayExpression',
  Assignment = 'AssignmentExpression',
  Function = 'FunctionExpression',
  Unary = 'UnaryExpression',
  New = 'NewExpression',
  ArrowFunction = 'ArrowFunctionExpression',
  Call = 'CallExpression',
  Member = 'MemberExpression',
}
enum ElementType {
  Spread = 'Spread',
}

const isSpreadElement = isFn<ESTree.Node>('type', ElementType.Spread);
const isLiteral = isFn<ESTree.Node>('type', SimpleType.Literal);

//#region traverse AST

const defaultVisitors = walker.make({});

type RecursiveWalkerFn<T> = (
  node: ESTree.Node,
  state: T,
) => ESTree.Node;

type TransformVisitors<T> = {
  [type: string]: RecursiveWalkerFn<T>
};


const transformAST = <T = unknown>(
  root: ESTree.Node,
  visitors: TransformVisitors<T> = {},
  baseVisitor = defaultVisitors,
  state: T = null,
) => {
  if (!baseVisitor) baseVisitor = defaultVisitors;

  return (function c(
    node: ESTree.Node | acorn.Node,
    st: T,
    type = node.type,
  ) {
    let newNode = node;
    const transformer = visitors[type];

    if (transformer) {
      const transformedNode = transformer(newNode as ESTree.Node, st);
      // replacing
      if (newNode) newNode = transformedNode;
    }
    baseVisitor[type](newNode as acorn.Node, st, c);
    return newNode;
  })(root, state);
};


//#endregion

const isOpType = (type: unknown) => pred.isAggregate({ type });
const isOpTypeProp = (prop: ESTree.Property) => (
  (prop.key as ESTree.Identifier).name === 'type'
  && isOpType((prop.value as ESTree.Literal).value)
);
const isOpFieldsProp = (prop: ESTree.Property) => (
  (prop.key as ESTree.Identifier).name === 'fields'
  && prop.value.type === ExpressionType.Array
  && (prop.value as ESTree.ArrayExpression).elements.every(isLiteral)
);

export const predAST = {
  isOperator: (node: ESTree.Node) => {
    if (node.type !== ExpressionType.Object) return false;
  
    const objExpr = node as ESTree.ObjectExpression;
    if (objExpr.properties.length !== 2) return false;
    if (objExpr.properties.some(isSpreadElement)) return false;
  
    const [typeProp, fieldsProp] = objExpr.properties as ESTree.Property[];
    return isOpTypeProp(typeProp) && isOpFieldsProp(fieldsProp);
  },
};

export const fromAST = {
  operator: (node: any): Operator => ({
    type: node.properties[0].value.value,
    fields: node.properties[1].value.elements.map(e => e.value),
  }),
};
// t => op.sum(t['fields'])
const makeMemberExpr = (objName: string, propName: string): ESTree.MemberExpression => ({
  type: ExpressionType.Member,
  object: {
    type: SimpleType.Literal,
    name: objName,
  },
  property: {
    type: SimpleType.Literal,
    value: propName,
    raw: `'${propName}'`
  },
  computed: true,
  optional: false,
}) as any;

export const makeOpExpr = (op: Operator, tableName = 't', opName = 'op'): ESTree.ArrowFunctionExpression => ({
  type: ExpressionType.ArrowFunction,
  params: [{
    type: SimpleType.Literal,
    name: tableName,
  }],
  body: {
    type: ExpressionType.Call,
    callee: makeMemberExpr(opName, op.type),
    arguments: op.fields.map(field => makeMemberExpr(tableName, field))
  }
}) as any;
