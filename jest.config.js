module.exports = {
  rootDir: '.',
  verbose: true,
  transform: {
    // "^.+\\.(ts)$": '<rootDir>/test/fileTransformer.js'
    "^.+\\.(ts)$": 'ts-jest'
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    'PureUtils': '<rootDir>/src/utils/pureUtils',
    'Typings': '<rootDir>/src/typings',
    'CommonTypings': '<rootDir>/src/typings/common',
    'CommonUtils': '<rootDir>/src/utils',
    'Modules': '<rootDir>/src/modules',
    'Extensions': '<rootDir>/src/extensions',
  }
};