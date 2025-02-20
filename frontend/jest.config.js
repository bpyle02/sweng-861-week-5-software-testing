/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'jsdom',
    transform: {
      "^.+\\.jsx?$": "babel-jest"
    },
    collectCoverage: true,
    coverageDirectory: "./coverage",
    testMatch: ['**/*.test.js'],
    moduleFileExtensions: ['js', 'mjs', 'json'],
    testTimeout: 3000,
    moduleNameMapper: {
      '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
    },
  };
  
  export default config;