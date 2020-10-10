/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const bs = require("browser-sync").create();
const eb = require('esbuild');

const buildOptions = {
  entryPoints: ['./src/index.ts'],
  outfile: 'dist/bow.js',
  bundle: true,
  target: 'es6',
  platform: 'browser',
  tsconfig: './tsconfig.json',
  loader: {
    '.ts': 'ts',
  },
  sourcemap: true,
  globalName: 'bow',
};

eb.build(buildOptions)
  .then(() => bs.init({
    server: './',
  }))
  .catch(err => {
    console.log(err);
    process.exit(1);
  });

bs.watch('./src/**/*.ts', () => {
  eb.build(buildOptions)
    .then(() => bs.reload())
    .catch(err => {
      console.log(err);
    });
});
