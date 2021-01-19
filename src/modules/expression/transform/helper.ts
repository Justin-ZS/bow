import * as ESTree from 'estree';
import { generate } from 'escodegen';

import { pred } from 'CommonUtils';
import { AggregateOp } from 'Typings';
import { isFn } from 'PureUtils';

import { ExpressionType, ElementType, SimpleType } from './constant';

const isSpreadElement = isFn<ESTree.Node>('type', ElementType.Spread);
const isLiteral = isFn<ESTree.Node>('type', SimpleType.Literal);

const isOpType = (type: unknown) => pred.isAggregate({ type });
const isOpTypeProp = (prop: ESTree.Property) => (
  (prop.key as ESTree.Literal).value === 'type'
  && isOpType((prop.value as ESTree.Literal).value)
);
const isOpFieldsProp = (prop: ESTree.Property) => (
  (prop.key as ESTree.Literal).value === 'fields'
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
  operator: (node: any): AggregateOp => ({
    type: node.properties[0].value.value,
    fields: node.properties[1].value.elements.map(e => e.value),
  }),
};

export const makeMemberExpr = (objName: string, propName: string, computed: boolean): ESTree.MemberExpression => ({
  type: ExpressionType.Member,
  object: {
    type: SimpleType.Identifier,
    name: objName,
  },
  property: computed
    ? {
      type: SimpleType.Literal,
      value: propName,
      raw: `'${propName}'`
    }
    : {
      type: SimpleType.Identifier,
      name: propName,
    },
  computed,
  optional: false,
}) as any;

// (t, op) => op.sum(t['fields'])
export const makeOpExpr = (op: AggregateOp, tableName = 't', opName = 'op'): ESTree.ArrowFunctionExpression => ({
  type: ExpressionType.ArrowFunction,
  expression: true,
  generator: false,
  async: false,
  params: [
    {
      type: SimpleType.Identifier,
      name: tableName,
    },
    {
      type: SimpleType.Identifier,
      name: opName,
    }],
  body: {
    type: ExpressionType.Call,
    callee: makeMemberExpr(opName, op.type, false),
    arguments: op.fields.map(field => makeMemberExpr(tableName, field, true))
  }
}) as any;

export const makeOpMember = (
  objName: string,
  ...args: Parameters<typeof makeOpExpr>
): ESTree.MemberExpression =>
  makeMemberExpr(objName, generate(makeOpExpr(...args)), true);