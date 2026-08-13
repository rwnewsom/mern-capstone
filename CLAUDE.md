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
│   ├── exercise_controller.mjs # Route handlers and validation
│   ├── exercise_model.mjs      # MongoDB models and CRUD operations
│   ├── logger.mjs              # Structured logging utility
│   ├── Dockerfile              # Production container for backend
│   ├── package.json
│   ├── .env.example            # Environment template (commit to repo)
│   ├── .env                    # Actual env file (in .gitignore)
│   ├── .dockerignore
│   └── test/
│       └── exercise_controller.test.mjs  # Unit and integration tests
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
│   │   │   └── api.js             # Fetch utilities with timeout/error handling
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
- Input validation happens in `exercise_controller.mjs` before database operations
- `validateExerciseInput()` is a pure function that can be tested independently
- Validation covers: type checking, field presence, value ranges, enum constraints

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
  - `fetchWithTimeout()`: AbortController-based fetch with configurable timeout (default 15s)
  - `handleApiError()`: Converts errors to user-friendly messages
- All pages use these utilities instead of raw fetch()
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
- 15 unit/integration tests for endpoint validation and response codes
- Tests are in `backend-rest/test/` using Node built-in test runner
- No external test framework dependencies (uses only node:test and node:assert)

**Test Approach:**
- Validation tests: Pure function testing of `validateExerciseInput()`
- Endpoint simulation tests: Mock response objects to test status codes and response format
- Not yet: Real database integration tests (would require test database container)

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
- Descriptive names: `validateExerciseInput`, `fetchWithTimeout`
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
- Set MongoDB connection string for Atlas or local MongoDB
- Frontend uses Vite proxy to backend on localhost:3000

**Docker (Local):**
- docker-compose.yml handles all environment setup
- Services reference each other by hostname
- MongoDB runs in container with persistent volume

**Production (AWS ECS):**
- Environment variables passed via ECS task definition
- MongoDB connection string from AWS Secrets Manager or RDS
- Health checks configured in ECS task definition
- Graceful shutdown not yet implemented (TODO: Phase 5)

## Development Workflow

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
4. **Tests:** Add to `backend-rest/test/exercise_controller.test.mjs`, run `npm test`
5. **API endpoints:** Add to `exercise_controller.mjs`, test before committing

### Git Workflow

- Main branch is production-ready
- Feature branches for new work
- Commit messages describe "why", not "what" (code shows what)
- `.env` files are in `.gitignore` (never commit credentials)
- `plan.md` is in `.gitignore` (work document, not part of deliverable)

## Known Limitations & Future Work

### Not Yet Implemented (Phase 4+)

- Real database integration tests (would need test MongoDB container)
- Frontend component tests (Vitest/Jest)
- Input sanitization (escape special characters)
- Rate limiting (express-rate-limit)
- Graceful shutdown on SIGTERM
- API versioning (/v1/exercises)
- Frontend tests (smoke tests, component tests)

### Tested Scenarios

- ✅ CRUD validation (all fields required, correct types)
- ✅ Endpoint response codes (201, 200, 204, 400, 404)
- ✅ Error responses (consistent { Error: "message" } format)
- ✅ Docker containerization
- ✅ Health checks
- ✅ Structured logging
- ✅ Request timeouts
- ✅ Error boundaries
- ✅ Toast notifications

### Not Tested Yet

- Real MongoDB operations (integration tests)
- Frontend component rendering
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
3. Add test to `backend-rest/test/exercise_controller.test.mjs`
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

**Last Updated:** 2026-08-13  
**Project Status:** Phase 3 Complete - Ready for Phase 4 (Testing & Docs)
