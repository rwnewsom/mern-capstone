import { setTimeout, setInterval, clearTimeout, clearInterval } from 'node:timers';
import mongoose from 'mongoose';
import { logger } from './logger.mjs';
import { shutdownTracing } from './tracing.mjs';

const SHUTDOWN_TIMEOUT = 30000; // 30 seconds

let activeRequests = 0;
let isShuttingDown = false;

const trackRequest = (req, res, next) => {
  activeRequests += 1;

  res.on('finish', () => {
    activeRequests -= 1;
  });

  res.on('close', () => {
    activeRequests -= 1;
  });

  next();
};

const setupGracefulShutdown = (server) => {
  const handleShutdown = async (signal) => {
    if (isShuttingDown) {
      logger.warn(`Shutdown already in progress, ignoring ${signal}`);
      return;
    }

    isShuttingDown = true;
    logger.info(`Received ${signal}, starting graceful shutdown`);

    // Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Wait for in-flight requests with timeout
    const shutdownTimeout = setTimeout(async () => {
      logger.warn(`Shutdown timeout after ${SHUTDOWN_TIMEOUT}ms, forcing exit`);
      await shutdownTracing();
      await closeDatabase();
      process.exit(1);
    }, SHUTDOWN_TIMEOUT);

    // Poll for in-flight requests
    const waitForRequests = setInterval(async () => {
      if (activeRequests === 0) {
        clearInterval(waitForRequests);
        clearTimeout(shutdownTimeout);
        logger.info('All requests completed');
        await shutdownTracing();
        await closeDatabase();
        process.exit(0);
      } else {
        logger.info(`Waiting for ${activeRequests} active request(s) to complete`);
      }
    }, 1000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception, initiating shutdown', {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection, initiating shutdown', {
      reason: reason instanceof Error ? reason.message : String(reason),
    });
    process.exit(1);
  });
};

const closeDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    logger.info('Database already disconnected');
    return;
  }

  try {
    logger.info('Closing database connection');
    await mongoose.connection.close();
    logger.info('Database connection closed');
  } catch (err) {
    logger.error('Error closing database connection', {
      error: err.message,
    });
  }
};

export { trackRequest, setupGracefulShutdown, activeRequests };
