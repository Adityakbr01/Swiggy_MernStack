// utils/logger.ts

import winston from 'winston';

// Configure winston logger
const logger = winston.createLogger({
  level: 'info',  // Set the default log level (you can change this to 'debug' for more detailed logs)
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),  // Include timestamp for each log entry
    winston.format.colorize(),  // Colorize the log levels (e.g., info, warn, error)
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({ // Output to the console
      level: 'info',  // Default log level for the console
    }),
    new winston.transports.File({
      filename: 'logs/app.log',  // Log to a file called app.log in the logs directory
      level: 'info',  // Log level for the file transport
      maxsize: 1000000,  // Max file size before rotating (1 MB)
      maxFiles: 3,  // Keep 3 log files (older logs will be deleted)
      tailable: true,  // Keep the most recent logs in the file
    }),
  ],
});

// Export the logger for use in other parts of the application
export { logger };