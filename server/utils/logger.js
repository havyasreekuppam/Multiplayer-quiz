import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Winston Logger Configuration
 * Centralized logging for development and production
 */

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  // Console transport
  new winston.transports.Console(),

  // Error log file
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error',
    format: winston.format.uncolorize(),
  }),

  // All logs file
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/all.log'),
    format: winston.format.uncolorize(),
  }),
];

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  format,
  transports,
});

/**
 * Wrapper functions for consistent logging
 */
export const logError = (message, error = null, context = {}) => {
  logger.error(`${message}${error ? ': ' + error.message : ''}`, { context });
};

export const logWarn = (message, context = {}) => {
  logger.warn(message, { context });
};

export const logInfo = (message, context = {}) => {
  logger.info(message, { context });
};

export const logDebug = (message, context = {}) => {
  logger.debug(message, { context });
};

export const logHttp = (message, context = {}) => {
  logger.http(message, { context });
};

export default logger;
