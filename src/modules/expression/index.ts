import { isFunction, isArray, isRecord, mapRecord, instantiate } from 'PureUtils';

import parseES from './parse';
import validateAST from './validate';
import transformAST, { state } from './transform';
import generateES from './generate';

export const resolveExpr = (expr: any, { debug = false } = {}) => {
  const esAST = parseES(expr);

  validateAST(esAST);

  const ops: Record<string, Function> = {};
  const transformedAST = transformAST(esAST, { operatorCollection: ops });
  if (debug) console.log('Operator Collection:', ops);
  if (debug) console.log('Transformed AST:', transformedAST);

  const esStr = generateES(transformedAST);
  if (debug) console.log('Generated Code:', esStr);

  const getter = instantiate(esStr, state.operatorResults);  

  return { ops, getter };
};

export const collectOps = (exprObj: Record<string, any>) => {
  const ops: Record<string, Function> = {};

  const findOpRec = (target: any) => {
    if (isFunction(target)) ops[target] = target;
    if (isArray(target)) target.forEach(findOpRec);
    if (isRecord(target)) mapRecord(findOpRec, target);
  };

  Object.values(exprObj).forEach(findOpRec);

  return ops;
};

export const fulfillValues = (ops: Record<string, any>, values: any) => {
  const setValueRec = (key: any, parent: Record<string, any>) => {
    const target = parent[key];

    if (isFunction(target)) parent[key] = ops[target];
    if (isArray(target)) target.forEach((val, idx) => setValueRec(idx, target));
    if (isRecord(target)) mapRecord((val, key) => setValueRec(key, target), target);
  };

  const fulfilled = { ...values };
  setValueRec('fulfilled', { fulfilled });
  return fulfilled;
};

// TODO
export const resolveValues = i => i;

export default resolveExpr;