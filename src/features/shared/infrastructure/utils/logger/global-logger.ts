// globalLogger.ts (or logger.js)
import logger from './logger';

// Override console methods with Winston logger
global.console.log = (...args) => logger.info(...args);
global.console.error = (...args) => logger.error(...args);
global.console.warn = (...args) => logger.warn(...args);
global.console.info = (...args) => logger.info(...args);
