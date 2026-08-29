import { trace, context, propagation } from '@opentelemetry/api';
import { initTracing } from './tracing';

const DEFAULT_TIMEOUT = 15000; // 15 seconds

// Empty by default: every call site passes a same-origin path (e.g.
// '/exercises'), which the dev server (vite.config.js) or Nginx
// (nginx.conf) proxies to the backend — no CORS, no per-environment
// rebuild. Set VITE_API_URL only if the frontend and backend don't
// share an origin/proxy (e.g. deployed to two separate hosts).
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const tracer = initTracing();

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const fetchWithTimeout = async (path, options = {}, timeoutMs = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const method = options.method || 'GET';
  const span = tracer?.startSpan(`fetch ${method} ${path}`);

  try {
    const authHeader = getAuthHeader();
    const headers = { ...authHeader, ...options.headers };

    if (span) {
      span.setAttributes({ 'http.method': method, 'http.url': path });
      // Injects a W3C traceparent header so the backend's HTTP span (see
      // exercise_controller.mjs) links as a child of this span, instead of
      // frontend and backend traces staying disconnected in Jaeger.
      propagation.inject(trace.setSpan(context.active(), span), headers);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    span?.setAttributes({ 'http.status_code': response.status });
    span?.end();

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('username');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    span?.recordException(error);
    span?.end();
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
};

export const handleApiError = (error) => {
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return 'Unable to connect to the server. Please check your connection.';
  }
  if (error.message.includes('timeout')) {
    return 'Request took too long. Please try again.';
  }
  return error.message || 'An unexpected error occurred.';
};
