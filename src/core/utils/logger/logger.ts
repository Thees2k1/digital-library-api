// utils/logger.ts (or logger.js)
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = createLogger({
  level: 'info', // Default logging level
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // Print error stack traces
    format.splat(), // String interpolation support
    format.json(), // Output logs in JSON format
  ),
  defaultMeta: { service: 'app' }, // Replace with your service name
  transports: [
    // Log to a file
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),

    // Log to the console
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          (info) => `${info.timestamp} [${info.level}]: ${info.message}`,
        ),
      ),
    }),
  ],
});

// If we're not in production, log to the console with a simpler format
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
}

logger.add(
  new DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d', // Keep logs for 14 days
  }),
);

export default logger;
