import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Every path the backend actually serves (see backend-rest/exercise_controller.mjs,
// auth_routes.mjs, user_routes.mjs) needs a proxy entry here, mirroring nginx.conf's
// production proxy — otherwise a relative-path fetch() 404s against the dev server
// itself instead of reaching the backend.
const BACKEND_URL = 'http://localhost:3000';
const PROXIED_PATHS = ['/exercises', '/auth', '/users', '/metrics', '/config'];

// Trace export (src/utils/tracing.js) goes to Jaeger directly, not the
// backend — Jaeger's OTLP/HTTP receiver doesn't send
// Access-Control-Allow-Origin, so the browser can't call it cross-origin no
// matter what; proxying it same-origin sidesteps that entirely. Requires
// Jaeger running (e.g. `docker compose up jaeger`) — if it's not reachable,
// spans just fail to export (see tracing.js's graceful degradation).
const JAEGER_OTLP_URL = 'http://localhost:4318';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      ...Object.fromEntries(PROXIED_PATHS.map((path) => [path, BACKEND_URL])),
      '/v1/traces': JAEGER_OTLP_URL,
    },
  },
});
