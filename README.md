# Exercise Tracker MERN App

This project is a simple full-stack exercise tracking application built with the MERN stack:

- MongoDB
- Express
- React
- Node.js

This was completed as the capstone project for CS290 (Web Development) at Oregon State University

# NOTE - uses Virginia Tech Colors and logo because my kid recently got accepted there

## Project Structure

- backend-rest: Express API and MongoDB model/controller
- frontend-react: React frontend built with Vite

## Prerequisites

### Global Requirements
- Node.js 20+ and npm installed
- Git for version control

### MongoDB Setup (Choose One)

**Option A: Docker Compose (Recommended - Easiest)**
- Docker and Docker Compose installed
- No local MongoDB installation needed
- Database runs in a container, automatically managed

**Option B: Local MongoDB**
- [Install MongoDB Community Edition](https://docs.mongodb.com/manual/installation/) on your machine
- MongoDB service running locally (mongod)
- Connection string: `mongodb://localhost:27017/exercise-tracker`

**Option C: MongoDB Atlas (Cloud-hosted)**
- Free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Cluster created in Atlas
- Connection string from Atlas dashboard (includes credentials)

## Setup

### Local Development Setup (Without Docker)

**Step 1: Clone and Install Dependencies**
```bash
git clone <repository-url>
cd newsomro-a9

# Backend
cd backend-rest
npm install

# Frontend (in another terminal)
cd ../frontend-react
npm install
```

**Step 2: Configure MongoDB**

Create `backend-rest/.env` by copying and editing `.env.example`:

```bash
cd backend-rest
cp .env.example .env
```

Edit `.env` and uncomment ONE of the MongoDB options:

**For Local MongoDB:**
```env
MONGODB_CONNECT_STRING=mongodb://localhost:27017/exercise-tracker
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
```

**For MongoDB Atlas:**
```env
MONGODB_CONNECT_STRING=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?appName=exercise-tracker
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
```

**Step 3: Start the Application**

Terminal 1 - Backend:
```bash
cd backend-rest
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend-react
npm run dev
```

Access the app at `http://localhost:5173`

### Docker Setup (Recommended for Development & Production)

Docker Compose includes **everything you need** - backend, frontend, and **local MongoDB**. No separate MongoDB installation required.

#### First-Time Setup

1. Clone the repository
2. Ensure Docker and Docker Compose are running
3. From the project root directory, build and start all services:
   ```bash
   docker-compose up --build
   ```
   
   On first run, Docker will:
   - Build the backend and frontend images
   - Pull the MongoDB image
   - Create and start all containers with local MongoDB database
   - Automatically configure MongoDB connection (no .env setup needed)

#### Daily Usage

**Start the app:**
```bash
docker-compose up
```

**Start in background (detached mode):**
```bash
docker-compose up -d
```

**Stop all services:**
```bash
docker-compose down
```

**View live logs from all containers:**
```bash
docker-compose logs -f
```

**View logs from a specific service:**
```bash
docker-compose logs -f backend    # Backend API logs
docker-compose logs -f frontend   # Frontend/Nginx logs
docker-compose logs -f mongodb    # MongoDB logs
```

#### Accessing the Services

Once running, the app will be available at:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost | React web application |
| **Backend API** | http://localhost:3000 | REST API endpoints |
| **Backend Health** | http://localhost:3000/health | Health check |
| **Jaeger UI** | http://localhost:16686 | Distributed tracing |
| **Prometheus** | http://localhost:9090 | Metrics collection |
| **MongoDB** | localhost:27017 | Database (internal only) |

#### Rebuilding After Code Changes

If you modify the code and want to rebuild the Docker images:

```bash
docker-compose up --build
```

Or rebuild specific services:
```bash
docker-compose up --build backend
docker-compose up --build frontend
```

#### Removing All Data

To completely reset the application (including MongoDB data):
```bash
docker-compose down -v
docker-compose up --build
```

The `-v` flag removes the MongoDB data volume.

#### Docker Setup Features

- ✅ Automatic dependency installation
- ✅ Health checks for all services (MongoDB, Backend, Frontend)
- ✅ MongoDB instance with persistent data volume
- ✅ Nginx reverse proxy for the frontend
- ✅ API requests automatically proxied from frontend to backend
- ✅ CORS enabled for cross-service communication
- ✅ Hot-reload support for local development (code changes visible without rebuild)

## MongoDB Setup Comparison

| Feature | Docker Compose | Local MongoDB | MongoDB Atlas |
|---------|---|---|---|
| **Setup Time** | ~2 minutes | 10-15 minutes | 5 minutes |
| **Installation** | None (Docker only) | Manual install | None (cloud) |
| **Data Persistence** | Automatic (volumes) | Manual (filesystem) | Automatic (cloud) |
| **Best For** | Quick start, team consistency | Simple local dev | Production, remote teams |
| **Free Tier** | ✅ Yes | ✅ Yes | ✅ Yes (512MB) |
| **Requires Connection String** | No (auto-configured) | Yes | Yes |
| **Offline Development** | ✅ Works | ✅ Works | ❌ Requires internet |

**Quick Recommendation:**
- 👉 **New developers:** Use Docker Compose (easiest)
- 👉 **Prefer local setup:** Install MongoDB locally
- 👉 **Remote/team work:** Use MongoDB Atlas

## Running the App

### Using Docker Compose:
```bash
docker-compose up
```
Visit `http://localhost` in your browser.

### Using Local Setup (Without Docker):

Terminal 1 - Start backend:
```bash
cd backend-rest
npm start
```

Terminal 2 - Start frontend:
```bash
cd frontend-react
npm run dev
```

The frontend will be available at `http://localhost:5173`

## CI/CD Pipeline

This project uses GitHub Actions to automatically run tests on every pull request. All tests must pass before code can be merged to the main branch.

**Branch Protection Rules:**
- ✅ Pull requests required for all changes
- ✅ Backend and frontend tests must pass
- ✅ Branches must be up to date before merging
- ✅ Direct commits to main are disabled

**For detailed information:** See [GITHUB_WORKFLOW.md](./GITHUB_WORKFLOW.md)

### Development Workflow

1. **Create a feature branch** (never commit to main)
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test locally**
   ```bash
   npm test  # Run tests before pushing
   ```

3. **Push to GitHub and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **GitHub Actions runs tests automatically**
   - Backend tests (165 tests)
   - Frontend tests (29 tests)
   - Status shown in PR

5. **Fix any failing tests**
   - Tests fail? Fix locally and push again
   - Workflow runs automatically on each push

6. **Merge when tests pass**
   - ✅ All tests passing → PR can be merged
   - ❌ Any tests failing → PR is blocked

## Running Tests

### Local Testing (without Docker)

Run backend tests:
```bash
cd backend-rest
npm test
```

Uses Node's built-in test runner. Covers validation, auth, exercise-ownership isolation, admin authorization, rate limiting, health checks, metrics, and tracing — see [GITHUB_WORKFLOW.md](./GITHUB_WORKFLOW.md) for what runs in CI.

### Running Tests in Docker

To run tests inside the backend container:
```bash
docker-compose exec backend npm test
```

### Watch Mode (Local)

Run tests in watch mode for development:
```bash
cd backend-rest
node --test --watch
```

## API Endpoints

All endpoints return JSON responses. Base URL: `http://localhost:3000` (or appropriate host in production).

Every `/exercises` and `/users` endpoint requires a JWT — see **Authentication** below. Requests are also rate-limited (see **Rate Limiting**).

### Authentication

#### POST /auth/register
Create an account. Returns a JWT immediately (no separate login step needed).

**Request Body:**
```json
{ "email": "user@example.com", "username": "myusername", "password": "at-least-6-chars" }
```

**Status Code:** `201 Created` · `400 Bad Request` (invalid input, email/username already taken)

**Response (Success):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "email": "...", "username": "...", "role": "user" }
}
```

#### POST /auth/login
**Request Body:** `{ "email": "...", "password": "..." }`

**Status Code:** `200 OK` · `401 Unauthorized` (wrong credentials or deactivated account)

**Response (Success):** same shape as register, with `"message": "Login successful"`.

#### GET /auth/me
Validates the current token. **Status Code:** `200 OK` · `401 Unauthorized`

**Example:**
```bash
curl http://localhost:3000/auth/me -H "Authorization: Bearer <token>"
```

---

### Exercises

All exercise endpoints require `Authorization: Bearer <token>` and only ever operate on the requesting user's own exercises — one user can never read, update, or delete another user's exercise (an id that exists but belongs to someone else returns `404`, the same as an id that doesn't exist at all).

#### GET /exercises
Retrieve the authenticated user's exercises. **Status Code:** `200 OK`

```json
[
  { "_id": "507f...11", "name": "Pushups", "reps": 20, "weight": 0, "unit": "lbs", "date": "2026-08-12T00:00:00.000Z", "userId": "507f...ab" }
]
```

#### GET /exercises/:id
**Status Code:** `200 OK` · `404 Not Found`

#### POST /exercises
**Request Body:**
```json
{ "name": "Pushups", "reps": 20, "weight": 0, "unit": "lbs", "date": "2026-08-12" }
```

**Validation Rules:**
- `name` (string, required): 1–255 characters (trimmed)
- `reps` (integer, required): positive, > 0
- `weight` (integer, required): non-negative, >= 0
- `unit` (string, required): one of `kgs`, `lbs`, `miles`
- `date` (string, required): valid ISO 8601 date

**Status Code:** `201 Created` · `400 Bad Request` (see **Validation Errors** below)

**Example:**
```bash
curl -X POST http://localhost:3000/exercises \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{ "name": "Squats", "reps": 15, "weight": 135, "unit": "lbs", "date": "2026-08-12" }'
```

#### PUT /exercises/:id
Same validation rules and request body as POST. **Status Code:** `200 OK` · `400 Bad Request` · `404 Not Found`

#### DELETE /exercises/:id
**Status Code:** `204 No Content` (empty body) · `404 Not Found`

---

### User Management (admin only)

Every route below additionally requires the caller's token to have `role: "admin"` (`403 Forbidden` otherwise). An admin can never change their own role/status or delete their own account (`400 Bad Request`), to avoid locking out the last admin.

| Method & Path | Purpose | Status Codes |
|---|---|---|
| `GET /users` | List all users (password field excluded) | `200` |
| `GET /users/:id` | Get one user | `200` · `404` |
| `PUT /users/:id/role` | Body: `{ "role": "user" \| "admin" }` | `200` · `400` · `404` |
| `PUT /users/:id/status` | Body: `{ "isActive": boolean }` — deactivated users can't log in | `200` · `400` · `404` |
| `DELETE /users/:id` | | `204` · `400` · `404` |

---

### Observability

#### GET /health
Reports database connectivity, for container/orchestrator health checks. See [HEALTH_CHECKS.md](./HEALTH_CHECKS.md) for the full response shape and integration details.

**Status Code:** `200 OK` (healthy) · `503 Service Unavailable` (degraded)

```json
{ "status": "healthy", "timestamp": "...", "checks": { "database": { "status": "healthy", "message": "Connected" } }, "responseTime": 2 }
```

#### GET /metrics
Request counts, error rates, and response-time stats. Defaults to Prometheus text format (what `prometheus.yml` scrapes); pass `?format=json` for the same data as JSON.

```bash
curl http://localhost:3000/metrics
curl http://localhost:3000/metrics?format=json
```

#### GET /config/units
Returns the valid `unit` values for exercises: `{ "units": ["kgs", "lbs", "miles"] }`.

---

## Error Handling

### Validation Errors (400 Bad Request)

`POST`/`PUT /exercises` and the `/auth/*` and `/users/*` validation failures return a consistent shape naming every invalid field:

```json
{
  "Error": "Validation failed",
  "details": [
    { "field": "reps", "message": "Reps must be a positive integer" }
  ]
}
```

### Not Found (404 Not Found)
```json
{ "Error": "Not found" }
```
Returned when a route references an exercise or user that doesn't exist — or, for exercises, exists but belongs to a different user.

### Rate Limiting (429 Too Many Requests)

| Scope | Limit |
|---|---|
| `/auth/register`, `/auth/login` | 5 requests / 15 minutes |
| `/exercises` (POST/PUT) | 200 requests / hour |
| Everything else | 100 requests / 15 minutes |

All limits are per-IP and disabled when `NODE_ENV=development`.

---

## Environment Variables

### Backend (.env file)

Create `backend-rest/.env`. `PORT`, `MONGODB_CONNECT_STRING`, and `JWT_SECRET` are required — the server refuses to start without them:
```
PORT=3000
MONGODB_CONNECT_STRING=mongodb://[username]:[password]@host:port/database
JWT_SECRET=your_jwt_secret_key_here
```

**For Docker:** Use MongoDB connection string with service name:
```
MONGODB_CONNECT_STRING=mongodb://username:password@mongodb:27017/exercises
```

See [ENVIRONMENT.md](./ENVIRONMENT.md) for the full list of optional variables (CORS, logging, Jaeger).

### Frontend (.env file)

Create `frontend-react/.env`:
```
VITE_API_URL=http://localhost:3000
```

**For Docker:** Use service name:
```
VITE_API_URL=http://backend:3000
```

---

## Troubleshooting

### Port Already in Use
If ports 80, 3000, or 27017 are already in use:

**Option 1:** Stop the process using the port
```bash
lsof -i :3000  # Find process on port 3000
kill -9 <PID>  # Kill the process
```

**Option 2:** Modify docker-compose.yml to use different ports
```yaml
ports:
  - "8000:3000"  # Maps container 3000 to localhost 8000
```

### MongoDB Connection Issues
If the backend can't connect to MongoDB:
1. Check MongoDB container is running: `docker-compose ps`
2. View MongoDB logs: `docker-compose logs mongodb`
3. Restart MongoDB: `docker-compose restart mongodb`

### Frontend Not Loading
1. Check Nginx is running: `docker-compose ps`
2. View Nginx logs: `docker-compose logs frontend`
3. Verify API proxy: Access http://localhost:3000/health directly
4. Check CORS headers: `curl -I http://localhost:3000/exercises`

### Rebuild Everything from Scratch
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

---

## Features

- Create, view, edit, and delete exercise entries, scoped to your own account
- JWT authentication, plus admin-only user management (roles, activation, deletion)
- REST API for exercise data, rate-limited per IP
- React-based user interface
- Full Docker containerization for production deployment
- Health monitoring, Prometheus metrics, and Jaeger distributed tracing
- CORS-enabled for cross-origin requests

## Screenshots

![exercise app](./frontend-react/public/Front_End.png)