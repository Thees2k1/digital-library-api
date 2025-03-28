// Extend Jest timeout for long-running tests (e.g., database or API calls)
jest.setTimeout(30000); // 30 seconds

// Mock global objects or libraries if needed
// Example: Mock console.error to suppress error logs during tests
jest.spyOn(console, 'error').mockImplementation(() => {});

// Example: Mock logger to avoid actual logging during tests
import logger from './src/core/utils/logger/logger';
jest.spyOn(logger, 'error').mockImplementation(() => logger);
jest.spyOn(logger, 'info').mockImplementation(() => logger);
jest.spyOn(logger, 'warn').mockImplementation(() => logger);
