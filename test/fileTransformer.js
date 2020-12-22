/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild');
// TODO: add source map for test debugging
function process(content, filename) {
  const result = esbuild.transformSync(content, {
    loader: 'ts',
    format: 'cjs',
    target: 'es6',
    sourcemap: true, 
    sourcefile: filename,
  });

  return {
    code: result.js,
    map: result.jsSourceMap,
  };
}

module.exports = {
  process,
};