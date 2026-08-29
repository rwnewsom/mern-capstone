import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Every path the backend actually serves (see backend-rest/exercise_controller.mjs,
// auth_routes.mjs, user_routes.mjs) needs a proxy entry here, mirroring nginx.conf's
// production proxy — otherwise a relative-path fetch() 404s against the dev server
// itself instead of reaching the backend.
const BACKEND_URL = 'http://localhost:3000';
const PROXIED_PATHS = ['/exercises', '/auth', '/users', '/metrics', '/config'];

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(PROXIED_PATHS.map((path) => [path, BACKEND_URL])),
  },
});
