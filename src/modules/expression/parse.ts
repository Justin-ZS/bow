import { parse } from 'acorn';
import * as ESTree from 'estree';
import transformAST, { SimpleType } from './transform';

const PARSE_OPTS: acorn.Options = {
  ecmaVersion: 'latest',
  sourceType: 'script',
};
const FUNC_PREFIX = '_is_Fn_\u001d';

// serialize function
const replacer = (key, value) => {
  if (typeof value === 'function') {
    return `${FUNC_PREFIX}${value}`;
  }
  return value;
};

const transformers = {
  [SimpleType.Literal]: (node) => { // restore function
    if (node.value.startsWith(FUNC_PREFIX)) {
      return parse(JSON.parse(node.raw).slice(FUNC_PREFIX.length), PARSE_OPTS);
    }
    return node;
  }
};

// Expression -> ES_AST
export const parseES = (expr: string | Function): ESTree.Node => {
  if (!expr) throw Error("ParseES: Empty Expression");
  try {
    const ast: any = parse(`expr=${JSON.stringify(expr, replacer)}`, PARSE_OPTS);
    const content = ast.body[0].expression.right;
    return transformAST(content, undefined, transformers);
  } catch(err) {
    throw Error(`ParseES: ${err}`);
  }
};

export default parseES;
