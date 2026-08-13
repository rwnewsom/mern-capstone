const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const isDevelopment = process.env.NODE_ENV === 'development';

const formatLog = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...data,
  });
};

export const logger = {
  error: (message, data) => {
    console.error(formatLog(LOG_LEVELS.ERROR, message, data));
  },

  warn: (message, data) => {
    console.warn(formatLog(LOG_LEVELS.WARN, message, data));
  },

  info: (message, data) => {
    console.log(formatLog(LOG_LEVELS.INFO, message, data));
  },

  debug: (message, data) => {
    if (isDevelopment) {
      console.debug(formatLog(LOG_LEVELS.DEBUG, message, data));
    }
  },
};

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};
