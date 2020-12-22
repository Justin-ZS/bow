import parseES from './parse';
import validateAST from './validate';
import transformAST from './transform';
import generateES from './generate';

const exprResolver = (expr: any) => {
  const esAST = parseES(expr);
  validateAST(esAST);
  const esStr = generateES(transformAST(esAST));
  return Function(`return ${esStr}`)();
};

export default exprResolver;