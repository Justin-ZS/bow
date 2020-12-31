import { generate } from 'escodegen';
import * as ESTree from 'estree';

const GEN_OPTS = {
  format: {
    indent: {
      style: '  ',
    }
  }
};

export const generateES = (esAST: ESTree.Node): string => {
  if (!esAST) throw Error("GenerateES: Empty AST");
  try {
    const code = generate(esAST, GEN_OPTS);
    return code;
  } catch (err) {
    throw Error(`GenerateES: ${err}`);
  }
};

export default generateES;
