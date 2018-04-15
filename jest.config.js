module.exports = {
  browser: true,
  notify: true,
  cache: false,
  modulePaths: [
    '<rootDir>',
  ],
  testMatch: [
    '<rootDir>/test/**/*.test.(js|ts)',
  ],
  moduleFileExtensions: [
    'js',
    'ts',
  ],
  collectCoverageFrom: [
    'src/app/**.(js|ts)',
  ],
  coverageReporters: ['html'],
  watchPathIgnorePatterns: ['<rootDir>/node_modules/'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/'],
  transform: {
    '^.+\\.js[x]?$': '<rootDir>/node_modules/babel-jest',
  },

};
