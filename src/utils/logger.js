const winston = require('winston');
const { NODE_ENV } = require('../config/env');

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const level = NODE_ENV === 'development' ? 'debug' : 'warn';

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  NODE_ENV === 'development'
    ? winston.format.colorize({ all: true })
    : winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack }) =>
    stack ? `${timestamp} ${level}: ${message}\n${stack}` : `${timestamp} ${level}: ${message}`
  )
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

const logger = winston.createLogger({ level, levels, format, transports });

module.exports = logger;
