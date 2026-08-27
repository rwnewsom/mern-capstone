import mongoose from 'mongoose';
import { logger } from './logger.mjs';

const checkDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return { status: 'healthy', message: 'Connected' };
    }
    if (mongoose.connection.readyState === 2) {
      return { status: 'unhealthy', message: 'Connecting' };
    }
    if (mongoose.connection.readyState === 3) {
      return { status: 'unhealthy', message: 'Disconnecting' };
    }
    return { status: 'unhealthy', message: 'Disconnected' };
  } catch (err) {
    logger.error('Database health check failed', { error: err.message });
    return { status: 'unhealthy', message: err.message };
  }
};

const getFullHealth = async () => {
  const startTime = Date.now();
  const database = await checkDatabase();
  const responseTime = Date.now() - startTime;

  const overallStatus = database.status === 'healthy' ? 'healthy' : 'degraded';

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks: {
      database,
    },
    responseTime,
  };
};

export { checkDatabase, getFullHealth };
