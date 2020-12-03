import { parse } from 'acorn';
import * as ESTree from 'estree';

const PARSE_OPTS: acorn.Options = {
  ecmaVersion: 'latest',
  sourceType: 'script',
};

// Expression -> ES AST
export const parseES = (expr: string | Function) => {
  if (!expr) throw Error("ParseES: Empty Expression");
  try {
    const ast: unknown = parse(`${expr}`, PARSE_OPTS);
    return (ast as ESTree.Program).body[0];
  } catch(err) {
    throw Error(`ParseES: ${err}`);
  }
};

export default parseES;
