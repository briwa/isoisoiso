module.exports = {
  browser: true,
  notify: true,
  cache: false,
  modulePaths: [
    '<rootDir>',
  ],
  testMatch: [
    '<rootDir>/test/**/*.test.ts',
  ],
  moduleFileExtensions: [
    'js',
    'ts',
  ],
  collectCoverageFrom: [
    'src/app/**.ts',
  ],
  coverageReporters: ['html'],
  watchPathIgnorePatterns: ['<rootDir>/node_modules/'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/'],
  transform: {
    '^.+\\.tsx?$' : 'ts-jest',
  },
  globals : {
    'ENV' : 'test',
    'ts-jest' : {
      extends : './tsconfig',
      babelConfig : {
        plugins : [
          'dynamic-import-node'
        ]
      }
    }
  }
};
