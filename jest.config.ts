import type { Config } from 'jest';

const config: Config = {
  verbose: true, // Display individual test results
  preset: 'ts-jest', // Use ts-jest to handle TypeScript files
  testEnvironment: 'node', // Set the test environment to Node.js
  moduleFileExtensions: ['ts', 'js', 'json'], // Recognize these file extensions
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'], // Match test files
  moduleNameMapper: {
    // Map module paths to match your TypeScript aliases
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest', // Transform TypeScript files using ts-jest
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json', // Use your project's tsconfig.json
    },
  },
  collectCoverage: false, // Enable test coverage collection
  collectCoverageFrom: [
    'src/**/*.{ts,js}', // Collect coverage from all source files
    '!src/**/*.d.ts', // Exclude type declaration files
    '!src/**/__tests__/**', // Exclude test files
    '!src/core/config/**', // Exclude configuration files
  ],
  coverageDirectory: '<rootDir>/coverage', // Output coverage reports to the coverage directory
  coverageReporters: ['text', 'lcov'], // Use text and lcov formats for coverage reports
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Add setup files for global configurations
  clearMocks: true, // Automatically clear mocks between tests
  resetMocks: true, // Reset mock state between tests
  restoreMocks: true, // Restore original implementations of mocked functions
};

export default config;
