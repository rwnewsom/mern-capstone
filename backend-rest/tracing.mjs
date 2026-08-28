import { trace } from '@opentelemetry/api';
import { NodeTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { logger } from './logger.mjs';

// Jaeger's all-in-one image accepts OTLP/HTTP natively (COLLECTOR_OTLP_ENABLED=true),
// so we export straight to it instead of the older Thrift/UDP agent protocol.
let provider = null;

const initTracing = (serviceName = 'exercise-tracker-backend') => {
  if (provider) {
    return trace.getTracer(serviceName);
  }

  try {
    const jaegerHost = process.env.JAEGER_HOST || 'localhost';
    const otlpPort = process.env.JAEGER_OTLP_PORT || '4318';
    const endpoint = `http://${jaegerHost}:${otlpPort}/v1/traces`;

    provider = new NodeTracerProvider({
      resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: serviceName }),
      spanProcessors: [
        new BatchSpanProcessor(new OTLPTraceExporter({ url: endpoint, timeoutMillis: 5000 })),
      ],
      // Bounds shutdown/flush time when Jaeger is unreachable (e.g. running the
      // backend outside Docker without `docker-compose up`), well under the
      // 30s graceful-shutdown budget in graceful_shutdown.mjs.
      forceFlushTimeoutMillis: 5000,
    });
    provider.register();

    logger.info('Tracing initialized', { serviceName, endpoint });
    return trace.getTracer(serviceName);
  } catch (err) {
    logger.warn('Tracing initialization failed, continuing without tracing', {
      error: err.message,
    });
    provider = null;
    return null;
  }
};

const shutdownTracing = async () => {
  if (!provider) {
    return;
  }

  try {
    await provider.shutdown();
  } catch (err) {
    // Expected when no Jaeger/OTLP collector is reachable (e.g. running
    // outside docker-compose) — flushing buffered spans just times out.
    logger.warn('Tracer shutdown did not flush cleanly', {
      error: err.code || err.message || String(err),
    });
  }
};

export { initTracing, shutdownTracing };
