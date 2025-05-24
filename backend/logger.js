// logger.js
const pino = require('pino');

// Configure pino-pretty for development
const transport = process.env.NODE_ENV === 'development' ? {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  }
} : undefined;

const logger = pino(transport);

module.exports = logger;
