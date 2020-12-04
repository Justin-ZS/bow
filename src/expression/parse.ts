import { parse } from 'acorn';
import * as ESTree from 'estree';

const PARSE_OPTS: acorn.Options = {
  ecmaVersion: 'latest',
  sourceType: 'script',
};

// Expression -> ES AST
export const parseES = (expr: string | Function): ESTree.Node => {
  if (!expr) throw Error("ParseES: Empty Expression");
  try {
    const ast: any = parse(`expr=${expr}`, PARSE_OPTS);
    return ast.body[0].expression.right;
  } catch(err) {
    throw Error(`ParseES: ${err}`);
  }
};

export default parseES;
