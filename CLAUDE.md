# Exercise Tracker MERN App - Developer Context

This document provides context about the project structure, conventions, and development practices for AI assistants and developers working on this codebase.

## Project Overview

**Exercise Tracker** is a full-stack fitness tracking application built with the MERN stack (MongoDB, Express, React, Node.js). It was created as a capstone project for CS290 (Web Development) at Oregon State University and has been enhanced for production deployment.

**Tech Stack:**
- **Backend:** Node.js + Express + MongoDB
- **Frontend:** React + Vite
- **Deployment:** Docker + Docker Compose, AWS ECS ready
- **Testing:** Node built-in test runner
- **Logging:** Structured JSON logging

## Project Structure

```
newsomro-a9/
├── backend-rest/              # Express API server
│   ├── exercise_controller.mjs # App setup, middleware wiring, /exercises + /health/metrics/config routes
│   ├── exercise_model.mjs      # Exercise schema and CRUD operations
│   ├── auth_controller.mjs     # register/login (bcrypt + JWT)
│   ├── auth_middleware.mjs     # verifyToken, verifyAdmin
│   ├── auth_routes.mjs         # /auth/* routes
│   ├── user_model.mjs          # User schema
│   ├── user_controller.mjs     # Admin user-management handlers
│   ├── user_routes.mjs         # /users/* routes (admin only)
│   ├── sanitizer.mjs           # express-validator chain for exercise fields
│   ├── rate_limiter.mjs        # express-rate-limit configs (global/auth/exercise)
│   ├── config.mjs              # Env var loading + startup validation
│   ├── constants.mjs           # Shared constants (valid units, error shapes)
│   ├── logger.mjs              # Structured logging utility
│   ├── health_check.mjs        # GET /health
│   ├── metrics.mjs / prometheus_metrics.mjs  # In-memory metrics + Prometheus text format
│   ├── tracing.mjs             # OpenTelemetry -> Jaeger (OTLP/HTTP)
│   ├── db_instrumentation.mjs  # Wraps DB calls in trace spans
│   ├── graceful_shutdown.mjs   # SIGTERM/SIGINT drain + tracer/DB shutdown
│   ├── Dockerfile              # Production container for backend
│   ├── package.json
│   ├── .env.example            # Environment template (commit to repo)
│   ├── .env                    # Actual env file (in .gitignore)
│   ├── .dockerignore
│   └── test/                   # node:test suite (165 tests) + test/helpers/
│
├── frontend-react/            # React SPA
│   ├── src/
│   │   ├── App.jsx             # Root component with ErrorBoundary
│   │   ├── components/
│   │   │   ├── ErrorBoundary.jsx  # Error catching component
│   │   │   ├── Toast.jsx          # Notification component
│   │   │   └── Toast.css
│   │   ├── pages/
│   │   │   ├── CreateExercise.jsx
│   │   │   ├── EditExercise.jsx
│   │   │   └── RetrieveExercises.jsx
│   │   ├── utils/
│   │   │   ├── api.js             # Fetch utilities with timeout/error handling; also creates a
│   │   │   │                      #   trace span per request (see tracing.js)
│   │   │   └── tracing.js         # OpenTelemetry -> Jaeger (via a same-origin proxy; see vite.config.js/nginx.conf)
│   │   └── index.css
│   ├── vite.config.js          # Build tool config
│   ├── Dockerfile              # Production container (Node build + Nginx)
│   ├── nginx.conf              # Nginx reverse proxy config
│   ├── .env.example
│   ├── .dockerignore
│   └── package.json
│
├── docker-compose.yml          # Local development container orchestration
├── README.md                   # User-facing documentation
├── plan.md                     # Implementation plan (in .gitignore)
├── CLAUDE.md                   # This file
├── .gitignore
└── .git/
```

## Key Design Decisions

### Backend Architecture

**Validation Strategy:**
- Exercise field validation is an `express-validator` chain in `sanitizer.mjs` (`validateExerciseFields` + `validationErrorHandler`), applied as middleware before `POST`/`PUT /exercises` reach the route handler
- Covers: type checking, field presence/length, value ranges, enum constraints
- Deliberately does *not* use `express-validator`'s `.escape()` — see the comment in `sanitizer.mjs`: it HTML-entity-encodes the value before it's persisted, which corrupts stored data for every consumer. Output encoding belongs at render time, not storage time.
- Auth input (`auth_controller.mjs`'s `validateAuthInput`) is a separate plain-function validator, not part of this chain

**Database Abstraction:**
- `exercise_model.mjs` handles all database operations
- Uses Mongoose for schema definition and MongoDB communication
- Singleton connection pattern: `connection` module variable caches the connection
- All CRUD operations are async functions that throw on error (caught by Express middleware)

**Error Handling:**
- `asyncHandler` middleware from `express-async-handler` catches all async errors
- Consistent error response format: `{ Error: "message" }`
- Status codes follow HTTP conventions: 400 (bad input), 404 (not found), 201 (created), 204 (deleted)

**Structured Logging:**
- `logger.mjs` provides JSON-formatted logging suitable for production log aggregators
- Every server request is logged via `requestLogger` middleware
- Request logs include: method, path, statusCode, duration_ms, ip

### Frontend Architecture

**Component Structure:**
- **Pages:** Each route/major feature is a page component (Create, Edit, Retrieve)
- **Components:** Reusable UI components (ErrorBoundary, Toast)
- **Utils:** Shared functions and API utilities

**Error Handling:**
- `ErrorBoundary` wraps entire app and catches rendering/lifecycle errors
- Displays user-friendly error message with page reload option
- Shows technical details only in development mode

**API Communication:**
- `api.js` provides two utilities:
  - `fetchWithTimeout()`: AbortController-based fetch with configurable timeout (default 15s); also creates a trace span per request and injects a W3C `traceparent` header so it links as a child of the backend's own HTTP span (`exercise_controller.mjs`) in Jaeger
  - `handleApiError()`: Converts errors to user-friendly messages
- All pages use these utilities instead of raw fetch()
- Every path a request needs (`/exercises`, `/auth`, `/users`, `/metrics`, `/config`, and `/v1/traces` for trace export) must be proxied in **both** `vite.config.js` (dev) and `nginx.conf` (Docker/prod) — a path missing from either 404s or falls through to the SPA's `index.html` instead of reaching its target
- Toast notifications provide immediate user feedback

**State Management:**
- Simple React hooks (useState) for local component state
- React Router for navigation
- No Redux or other state management (scope not required)

### Docker Strategy

**Multi-Stage Builds:**
- Backend: Single stage, Alpine base for minimal size
- Frontend: Two stages (build + Nginx serve) for optimized production image

**Service Communication:**
- Services reference each other by hostname (backend, mongodb, frontend)
- Nginx acts as reverse proxy for frontend → backend API calls
- Environment variables configure different endpoints per environment

**Health Checks:**
- All services have health checks for container orchestration
- Backend: GET /health endpoint
- Frontend: wget to Nginx /health endpoint
- MongoDB: mongosh ping command

### Testing Strategy

**Current Test Coverage:**
- 165 tests in `backend-rest/test/` using Node's built-in test runner
- No external test framework dependencies (uses only `node:test` and `node:assert`)

**Test Approach:**
- Pure-function tests: `validateAuthInput`, `sanitizer.mjs`'s validation chain (via `ValidationChain.run()`), middleware called directly with mock req/res (`auth_middleware.mjs`, `db_instrumentation.mjs`, etc.)
- Real HTTP integration tests (`auth_exercise_integration.test.mjs`, `user_routes.test.mjs`): spin up the real Express app on an ephemeral port (`app.listen(0)`) and drive it with real `fetch()` requests through the real middleware chain — auth, ownership filtering, admin authorization, and validation are all exercised for real, not re-simulated. Only the Mongoose model layer is stubbed, via `test/helpers/fakeCollection.mjs` (an in-memory stand-in wired in with `node:test`'s built-in `mock.method()`) — no test database, no new dependency
- Not yet: tests against a real (even in-memory) MongoDB — the Mongoose layer above is faked, so query-semantics bugs in a real deployment wouldn't be caught here
- **Caution when adding a "test" file:** earlier versions of `auth_exercise_integration.test.mjs` and `user_routes.test.mjs` asserted only against literals the test itself constructed (e.g. `const res = {statusCode: 401}; assert.equal(res.statusCode, 401)`) — passing, but exercising zero real code. If a test doesn't call into `app`/a real exported function, it isn't testing anything.

## Conventions & Practices

### Code Style

**JavaScript:**
- ES6 modules (`.mjs` extension)
- Use `const` by default, `let` only when variable reassignment needed
- Arrow functions for callbacks, regular functions for exports
- Async/await for promise handling

**Comments:**
- Minimal comments; let code be self-documenting
- Only add comments for non-obvious "why" (constraints, workarounds, gotchas)
- No docstrings or multi-line comment blocks

**Naming:**
- Descriptive names: `validateExerciseFields`, `fetchWithTimeout`
- Abbreviations only for universally understood terms: id, API, HTTP
- Avoid generic names: use `exercise` not `item`, `record`, `data`

### Error Handling

**Backend:**
- All route handlers are wrapped in `asyncHandler`
- Functions that can fail throw errors; let middleware handle them
- Return early on error (add `return` statements)

**Frontend:**
- Catch errors in try/catch blocks
- Use `handleApiError()` to convert errors to user messages
- Show errors via Toast notifications, not console.error

### Database

**MongoDB:**
- Collections follow singular naming: `exercises` collection
- Schema requires all fields: name, reps, weight, unit, date
- Dates stored as ISO 8601 strings or Date objects
- Queries use Mongoose methods: find(), findById(), updateOne(), deleteOne()

**Connection:**
- Environment variable: `MONGODB_CONNECT_STRING`
- Connection string format: `mongodb://[user]:[password]@host:port/db`
- Connection is established on server startup, reused for lifetime

### Environment Setup

**Development (Local):**
- Create `.env` file in backend-rest (copy from `.env.example`)
- Choose MongoDB setup: Docker Compose, Local MongoDB, or MongoDB Atlas
- See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed setup instructions
- Frontend uses Vite proxy to backend on localhost:3000

**Docker (Local):**
- docker-compose.yml handles all environment setup
- Services reference each other by hostname
- MongoDB runs in container with persistent volume
- No .env configuration needed (auto-configured)

**Production (AWS ECS):**
- Environment variables passed via ECS task definition
- MongoDB connection string from AWS Secrets Manager or RDS
- Health checks configured in ECS task definition
- Graceful shutdown implemented (`graceful_shutdown.mjs`): drains in-flight requests, flushes tracer spans, and closes the DB connection on SIGTERM/SIGINT, bounded by a 30s timeout — see [GRACEFUL_SHUTDOWN.md](./GRACEFUL_SHUTDOWN.md)

## Development Workflow - Branch Protection & CI/CD

### ⚠️ Important: No Direct Commits to Main

**As of Step 5.5, all changes must go through Pull Requests.**

- ❌ DO NOT commit directly to main
- ✅ DO create a feature branch
- ✅ DO push to GitHub and create a PR
- ✅ DO wait for GitHub Actions tests to pass
- ✅ DO merge only after tests pass

### GitHub Actions CI/CD Pipeline

Every pull request automatically runs:
1. **Backend tests** (165 tests) - Must pass
2. **Frontend tests** (34 tests) - Must pass
3. **All Tests Passed check** - Blocks merge if any fail

### Feature Branch Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes and commit
git add .
git commit -m "Your change description"

# 3. Test locally (BEFORE pushing)
npm test

# 4. Push to GitHub
git push origin feature/your-feature

# 5. Create Pull Request on GitHub
# - Go to GitHub
# - Click "New Pull Request"
# - Select main as base, your branch as compare
# - Add description and create PR

# 6. GitHub Actions runs tests automatically
# - Wait for tests to pass (2-3 minutes)
# - If fail: Fix and push again
# - If pass: PR is ready to merge

# 7. Merge the PR
# - Click "Merge pull request" on GitHub
# - Delete feature branch
# - Done!
```

### Running Locally

```bash
# Terminal 1: Backend
cd backend-rest
npm install
npm start   # Runs on port 3000

# Terminal 2: Frontend
cd frontend-react
npm install
npm run dev  # Runs on http://localhost:5173
```

### Running with Docker

```bash
# From project root
docker-compose up --build  # First time or after code changes
docker-compose up          # Subsequent runs
docker-compose down        # Stop services
```

### Running Tests

```bash
# Local
cd backend-rest
npm test

# Docker
docker-compose exec backend npm test

# Watch mode
node --test --watch
```

### Making Changes

1. **Code changes:** Edit files, Docker auto-reloads changes (if using volumes)
2. **Dependencies:** Add with `npm install`, rebuild Docker images if using containers
3. **Database schema:** Modify `exercise_model.mjs`, restart server
4. **Tests:** Add a `*.test.mjs` file under `backend-rest/test/`, run `npm test`
5. **API endpoints:** Add to `exercise_controller.mjs`, test before committing

### Git Workflow

**Branch Strategy:**
- `main` branch: Production-ready, stable code only
- Feature branches: All new work (feature/*, fix/*, refactor/*)
- Direct commits to main: ❌ NOT ALLOWED
- Pull requests: ✅ REQUIRED for all changes

**Branch Naming:**
- `feature/user-authentication` - New features
- `fix/validation-bug` - Bug fixes
- `refactor/api-structure` - Code improvements
- `docs/api-guide` - Documentation

**Commit Message Format:**
```
Brief summary (50 chars max)

Detailed explanation (if needed)
Keep to 72 chars per line

Relates to: (optional reference)
```

**Important Rules:**
- `.env` files are in `.gitignore` (never commit credentials)
- `plan.md` and `auth-plan.md` in `.gitignore` (work documents)
- Test before pushing
- Push to feature branch, create PR on GitHub
- Wait for GitHub Actions CI to pass
- Merge only after all tests pass

## Known Limitations & Future Work

### Not Yet Implemented

- Real database integration tests (current tests stub the Mongoose layer — see Testing Strategy above)
- API versioning (`/v1/exercises`)
- Core Web Vitals collection (Phase 8.5)
- Grafana dashboards on top of the existing Prometheus metrics (Phase 8.6)
- EKS/Kubernetes deployment (Phase 9 — planning doc only, not started; see `phase_9_eks_deployment.md`, gitignored)

### Tested Scenarios

- ✅ CRUD validation (all fields required, correct types)
- ✅ Endpoint response codes (201, 200, 204, 400, 404, 429)
- ✅ Error responses (consistent `{ Error: "message" }`, and `{ Error, details: [...] }` for field-level validation failures)
- ✅ JWT auth (register/login/verify, expired/invalid/missing tokens)
- ✅ Exercise ownership isolation (one user can never read/update/delete another's exercise)
- ✅ Admin authorization (`verifyAdmin`, self-lockout guards on role/status/delete)
- ✅ Rate limiting (per-route limits, dev-mode skip)
- ✅ Docker containerization
- ✅ Health checks
- ✅ Structured logging
- ✅ Request timeouts
- ✅ Error boundaries
- ✅ Toast notifications
- ✅ Graceful shutdown (request draining, tracer flush, DB close)
- ✅ Distributed tracing, backend-only (verified end-to-end against a live Jaeger container: HTTP spans, nested DB spans, correct parent/child linkage)
- ✅ Distributed tracing, frontend-to-backend (verified end-to-end: a browser `fetch` span, the backend's `POST /exercises` span, and its `db.exercises.insert` span all appear as one trace with correct parent/child references — confirmed via Jaeger's API, not just the UI. Also verified graceful degradation: stopping Jaeger mid-session causes a background console error only, no user-visible impact)
- ✅ Frontend component tests (Vitest, 34 tests)

### Not Tested Yet

- Real MongoDB query semantics (current tests use an in-memory fake, not a real/in-memory Mongo)
- Race conditions in concurrent requests
- Memory leaks under sustained load
- Cross-browser compatibility

## Debugging

### Backend Issues

**Check logs:**
```bash
npm start     # Local
docker-compose logs -f backend  # Docker
```

**Common issues:**
- Database connection: Check `MONGODB_CONNECT_STRING` and MongoDB is running
- Port in use: `lsof -i :3000`
- Invalid JSON: Check Content-Type header and JSON format

### Frontend Issues

**Check browser console:**
- Network tab: See API requests and responses
- Console: Check for JavaScript errors
- Application: Check localStorage/cookies

**Common issues:**
- API not responding: Check backend is running
- Toast notifications not showing: Check CSS is loaded
- CORS errors: Ensure backend has cors() middleware

### Docker Issues

```bash
docker-compose ps              # Check service status
docker-compose logs -f         # All logs
docker-compose logs -f backend # Specific service
docker-compose restart         # Restart services
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console.log statements in production code
- [ ] Environment variables configured for production
- [ ] CORS configured for production domain (not *)
- [ ] Health checks verified
- [ ] Docker images built and tested

### AWS ECS Setup (Future)

When deploying to ECS:
1. Create ECR repositories for backend and frontend images
2. Push Docker images: `docker push <repo-uri>:latest`
3. Create ECS task definition with environment variables
4. Configure health checks in task definition
5. Create ECS service with load balancer
6. Set CloudWatch alarms for monitoring

### Monitoring

Key metrics to watch:
- API response times (from structured logs)
- Error rates (4xx, 5xx responses)
- Container health (ECS health checks)
- Database connection pool status
- Disk/memory usage (MongoDB volume)

---

## Quick Reference

### Add a New Endpoint

1. Create validation function if needed
2. Add route handler to `exercise_controller.mjs`
3. Add a `*.test.mjs` file under `backend-rest/test/` covering it
4. Document in README.md API section
5. Test locally before committing

### Add Frontend Feature

1. Create component in `frontend-react/src/components/`
2. Use ErrorBoundary to wrap it
3. Use Toast for user feedback
4. Use `fetchWithTimeout()` for API calls
5. Test in browser before committing

### Debug API Call

1. Open browser DevTools Network tab
2. Make request, see status code and response
3. Check backend logs for request details
4. Verify request body matches validation rules

### Investigate Database Issue

1. Connect to MongoDB: `mongosh "mongodb://user:pass@host:port/db"`
2. Check documents: `db.exercises.find()`
3. View logs: `docker-compose logs -f mongodb`

---

**Last Updated:** 2026-08-28  
**Project Status:** Phases 1–7 (CRUD, auth, health checks, rate limiting, graceful shutdown) and Phase 8.1–8.4 (backend tracing/metrics/DB instrumentation, frontend tracing) complete. Ready for Phase 8.5+ (Core Web Vitals, Grafana dashboards) or Phase 9 (EKS deployment).
