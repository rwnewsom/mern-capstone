import 'dotenv/config';

const NODE_ENV = process.env.NODE_ENV || 'development';

const requiredEnvVars = ['MONGODB_CONNECT_STRING', 'JWT_SECRET', 'PORT'];

// Future: optionalEnvVars can be validated with defaults
// const optionalEnvVars = ['LOG_LEVEL', 'CORS_ORIGIN'];

const validateEnvironment = () => {
  const missing = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}.\n` +
        'Please check your .env file and ensure all required variables are set.'
    );
  }
};

const config = {
  nodeEnv: NODE_ENV,
  port: parseInt(process.env.PORT || '3000', 10),
  mongodb: {
    url: process.env.MONGODB_CONNECT_STRING,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  logging: {
    level: process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug'),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',
  isStaging: NODE_ENV === 'staging',
};

export { config, validateEnvironment };
