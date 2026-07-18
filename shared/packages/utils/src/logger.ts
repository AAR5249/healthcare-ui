import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
  })
);

export const createLogger = (serviceName: string): winston.Logger => {
  return winston.createLogger({
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console({
        format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
      }),
      new winston.transports.File({
        filename: `logs/${serviceName}-error.log`,
        level: 'error',
        format: logFormat,
      }),
      new winston.transports.File({
        filename: `logs/${serviceName}-combined.log`,
        format: logFormat,
      }),
    ],
  });
};
