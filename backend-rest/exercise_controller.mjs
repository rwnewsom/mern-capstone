import 'dotenv/config';

import asyncHandler from 'express-async-handler';
import cors from 'cors';
import { pathToFileURL } from 'node:url';

import express from 'express';
import * as exercises from './exercise_model.mjs';
import { logger, requestLogger } from './logger.mjs';
import { globalLimiter, exerciseLimiter } from './rate_limiter.mjs';
import { validateExerciseFields, validationErrorHandler } from './sanitizer.mjs';
import { VALID_UNITS, ERROR_RESPONSES } from './constants.mjs';
import authRoutes from './auth_routes.mjs';
import userRoutes from './user_routes.mjs';
import { verifyToken } from './auth_middleware.mjs';
import { config, validateEnvironment } from './config.mjs';
import { getFullHealth } from './health_check.mjs';
import { recordRequest, getMetrics } from './metrics.mjs';
import { formatPrometheusMetrics } from './prometheus_metrics.mjs';
import { trackRequest, setupGracefulShutdown } from './graceful_shutdown.mjs';
import { initTracing } from './tracing.mjs';
import { initDbTracer } from './db_instrumentation.mjs';
import { context, trace } from '@opentelemetry/api';

// Tracing initializes synchronously so this is settled before the request-span
// middleware below decides whether to register itself. initTracing() degrades
// to null (rather than throwing) if setup fails, so tracing is effectively optional.
const tracer = initTracing();
if (tracer) {
  initDbTracer(tracer);
}

const app = express();
app.use(express.json());
app.use(cors({ origin: config.cors.origin }));
app.use(requestLogger);
app.use(trackRequest);

if (tracer) {
  app.use((req, res, next) => {
    const span = tracer.startSpan(`${req.method} ${req.path}`);
    span.setAttributes({
      'http.method': req.method,
      'http.url': req.url,
      'http.target': req.path,
    });

    res.on('finish', () => {
      span.setAttributes({ 'http.status_code': res.statusCode });
      span.end();
    });

    // Activate the span in context so DB spans started later in this request
    // (traceDbOperation, via db_instrumentation.mjs) nest under it instead of
    // each becoming its own disconnected root trace.
    context.with(trace.setSpan(context.active(), span), next);
  });
}

app.use((req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function (data) {
    const responseTime = Date.now() - startTime;
    recordRequest(req.method, req.path, res.statusCode, responseTime);
    return originalSend.call(this, data);
  };

  next();
});

app.use(globalLimiter);

app.use('/auth', authRoutes);
app.use('/', userRoutes);

const PORT = config.port;

const { NOT_FOUND } = ERROR_RESPONSES;

const validateExerciseInput = (data) => {
  const { name, reps, weight, unit, date } = data ?? {};

  if (typeof name !== 'string' || name.trim() === '') {
    return null;
  }

  if (!Number.isInteger(reps) || reps <= 0) {
    return null;
  }

  if (!Number.isInteger(weight) || weight < 0) {
    return null;
  }

  if (typeof unit !== 'string' || !VALID_UNITS.includes(unit)) {
    return null;
  }

  if (typeof date !== 'string' || !Date.parse(date)) {
    return null;
  }

  return { name, reps, weight, unit, date };
};

const startServer = () => {
  try {
    validateEnvironment();
  } catch (err) {
    console.error('Environment validation failed:', err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, async () => {
    await exercises.connect();
    logger.info(`Server started`, { port: PORT });
  });

  setupGracefulShutdown(server);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}

export { validateExerciseInput };

app.get(
  '/health',
  asyncHandler(async (req, res) => {
    const health = await getFullHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    return res.status(statusCode).json(health);
  })
);

app.get(
  '/metrics',
  asyncHandler(async (req, res) => {
    const format = req.query.format || 'prometheus';

    if (format === 'json') {
      const metrics = getMetrics();
      return res.status(200).json(metrics);
    }

    // Default to Prometheus text format
    const prometheusMetrics = formatPrometheusMetrics();
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    return res.status(200).send(prometheusMetrics);
  })
);

app.get(
  '/config/units',
  asyncHandler(async (req, res) => {
    return res.status(200).json({ units: VALID_UNITS });
  })
);

app.post(
  '/exercises',
  verifyToken,
  exerciseLimiter,
  validateExerciseFields,
  validationErrorHandler,
  asyncHandler(async (req, res) => {
    const { name, reps, weight, unit, date } = req.body;
    const result = await exercises.createExercise(name, reps, weight, unit, date, req.userId);
    return res.status(201).json(result);
  })
);

app.get(
  '/exercises',
  verifyToken,
  asyncHandler(async (req, res) => {
    const result = await exercises.retrieveExercises(req.userId);
    return res.status(200).json(result);
  })
);

// debug note - missed trailing `/`
app.get(
  '/exercises/:id',
  verifyToken,
  asyncHandler(async (req, res) => {
    const exerciseId = req.params.id;
    const result = await exercises.retrieveExerciseById(exerciseId, req.userId);

    if (!result) {
      return res.status(404).json(NOT_FOUND);
    }

    return res.status(200).json(result);
  })
);

app.put(
  '/exercises/:id',
  verifyToken,
  exerciseLimiter,
  validateExerciseFields,
  validationErrorHandler,
  asyncHandler(async (req, res) => {
    const exerciseId = req.params.id;
    const { name, reps, weight, unit, date } = req.body;
    const updates = { name, reps, weight, unit, date };
    const result = await exercises.updateExerciseById(exerciseId, req.userId, updates);

    if (result.matchedCount === 0) {
      return res.status(404).json(NOT_FOUND);
    }

    const updatedExercise = await exercises.retrieveExerciseById(exerciseId, req.userId);
    return res.status(200).json(updatedExercise);
  })
);

app.delete(
  '/exercises/:id',
  verifyToken,
  asyncHandler(async (req, res) => {
    const exerciseId = req.params.id;
    const result = await exercises.deleteExerciseById(exerciseId, req.userId);

    if (result.deletedCount === 0) {
      return res.status(404).json(NOT_FOUND);
    }
    return res.status(204).json();
  })
);
