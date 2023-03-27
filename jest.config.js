/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['**/*.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '\\.d\\.ts'],
  coverageReporters: ['json-summary', 'html', 'text', 'text-summary'],
  coverageThreshold: {
      global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
      },
  },
};