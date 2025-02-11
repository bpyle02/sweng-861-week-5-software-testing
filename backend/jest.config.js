/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  transform: {},
  collectCoverage: true,
  coverageDirectory: "./coverage",
  testMatch: ['**/*.test.js'],
  moduleFileExtensions: ['js', 'mjs', 'json'],
};

export default config;