import { trace } from '@opentelemetry/api';
import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

// Browsers can't export straight to Jaeger's OTLP receiver: it doesn't send
// Access-Control-Allow-Origin on the preflight (verified directly against
// jaegertracing/all-in-one, including with --collector.otlp.http.cors.allowed-origins
// set), so the browser blocks the request regardless. '/v1/traces' is a
// same-origin relative path instead, proxied to Jaeger by vite.config.js
// (dev) or nginx.conf (Docker) — see the comments there.
const TRACE_EXPORT_URL = '/v1/traces';

let provider = null;

export const initTracing = (serviceName = 'exercise-tracker-frontend') => {
  if (provider) {
    return trace.getTracer(serviceName);
  }

  try {
    provider = new WebTracerProvider({
      resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: serviceName }),
      spanProcessors: [
        new BatchSpanProcessor(
          new OTLPTraceExporter({ url: TRACE_EXPORT_URL, timeoutMillis: 5000 })
        ),
      ],
    });
    // Default registration also sets up a StackContextManager and the W3C
    // trace-context propagator, which fetchWithTimeout uses (via
    // propagation.inject) to link each request as a child of the backend's
    // HTTP span -- see exercise_controller.mjs's tracing middleware.
    provider.register();

    return trace.getTracer(serviceName);
  } catch {
    // Never let tracing setup break the app -- same graceful-degradation
    // contract as the backend's tracing.mjs.
    provider = null;
    return null;
  }
};
