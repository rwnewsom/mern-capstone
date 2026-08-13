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

### Option 1: Local Development
- Node.js 20+ and npm installed
- A MongoDB Atlas connection string (for production) or use Docker Compose

### Option 2: Docker
- Docker and Docker Compose installed

## Setup

### Local Development Setup

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend-rest
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd ../frontend-react
   npm install
   ```
4. Configure the backend environment:
   - Create `backend-rest/.env` (copy from `.env.example`)
   - Update the MongoDB connection string in `backend-rest/.env`
   - Make sure PORT is set as needed

### Docker Setup (Recommended for Development & Production)

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
   - Create and start all containers
   - Initialize the MongoDB database

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

## Running the App

Start the backend:
```bash
cd backend-rest
npm start
```

Start the frontend in a separate terminal:
```bash
cd frontend-react
npm run dev
```

The frontend should then be available in your browser at the Vite local URL.

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
   - Backend tests (15 tests)
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

This uses Node's built-in test runner and exercises the backend validation logic.

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

### GET /health
Health check endpoint for monitoring service status.

**Status Code:** 200 OK

**Response:**
```json
{ "status": "ok" }
```

**Example:**
```bash
curl http://localhost:3000/health
```

---

### GET /exercises
Retrieve all exercises from the database.

**Status Code:** 200 OK

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Pushups",
    "reps": 20,
    "weight": 0,
    "unit": "lbs",
    "date": "2026-08-12T00:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Running",
    "reps": 1,
    "weight": 0,
    "unit": "miles",
    "date": "2026-08-11T00:00:00.000Z"
  }
]
```

**Example:**
```bash
curl http://localhost:3000/exercises
```

---

### GET /exercises/:id
Retrieve a specific exercise by its MongoDB ObjectId.

**Parameters:**
- `id` (string, required): MongoDB ObjectId of the exercise

**Status Code:** 
- `200 OK` - Exercise found
- `404 Not Found` - Exercise not found

**Response (Success):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Pushups",
  "reps": 20,
  "weight": 0,
  "unit": "lbs",
  "date": "2026-08-12T00:00:00.000Z"
}
```

**Response (Not Found):**
```json
{ "Error": "Not found" }
```

**Example:**
```bash
curl http://localhost:3000/exercises/507f1f77bcf86cd799439011
```

---

### POST /exercises
Create a new exercise record.

**Status Code:**
- `201 Created` - Exercise created successfully
- `400 Bad Request` - Invalid input

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Pushups",
  "reps": 20,
  "weight": 0,
  "unit": "lbs",
  "date": "2026-08-12"
}
```

**Validation Rules:**
- `name` (string, required): Non-empty exercise name
- `reps` (integer, required): Positive number > 0
- `weight` (integer, required): Non-negative number >= 0
- `unit` (string, required): One of: `kgs`, `lbs`, `miles`
- `date` (string, required): Valid ISO 8601 date (YYYY-MM-DD)

**Response (Success):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Pushups",
  "reps": 20,
  "weight": 0,
  "unit": "lbs",
  "date": "2026-08-12"
}
```

**Response (Invalid Input):**
```json
{ "Error": "Invalid request" }
```

**Example:**
```bash
curl -X POST http://localhost:3000/exercises \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Squats",
    "reps": 15,
    "weight": 135,
    "unit": "lbs",
    "date": "2026-08-12"
  }'
```

---

### PUT /exercises/:id
Update an existing exercise record.

**Parameters:**
- `id` (string, required): MongoDB ObjectId of the exercise

**Status Code:**
- `200 OK` - Exercise updated successfully
- `400 Bad Request` - Invalid input
- `404 Not Found` - Exercise not found

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:** (Same validation rules as POST)
```json
{
  "name": "Squats",
  "reps": 15,
  "weight": 185,
  "unit": "lbs",
  "date": "2026-08-12"
}
```

**Response (Success):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Squats",
  "reps": 15,
  "weight": 185,
  "unit": "lbs",
  "date": "2026-08-12"
}
```

**Response (Not Found):**
```json
{ "Error": "Not found" }
```

**Response (Invalid Input):**
```json
{ "Error": "Invalid request" }
```

**Example:**
```bash
curl -X PUT http://localhost:3000/exercises/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Squats",
    "reps": 15,
    "weight": 185,
    "unit": "lbs",
    "date": "2026-08-12"
  }'
```

---

### DELETE /exercises/:id
Delete an exercise record.

**Parameters:**
- `id` (string, required): MongoDB ObjectId of the exercise

**Status Code:**
- `204 No Content` - Exercise deleted successfully
- `404 Not Found` - Exercise not found

**Response (Success):**
No response body (204 No Content)

**Response (Not Found):**
```json
{ "Error": "Not found" }
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/exercises/507f1f77bcf86cd799439011
```

---

## Error Handling

### Common Error Responses

**Invalid Request (400 Bad Request):**
```json
{ "Error": "Invalid request" }
```
Returned when POST/PUT receives invalid or missing fields.

**Not Found (404 Not Found):**
```json
{ "Error": "Not found" }
```
Returned when GET/PUT/DELETE references a non-existent exercise.

---

## Environment Variables

### Backend (.env file)

Create `backend-rest/.env`:
```
PORT=3000
MONGODB_CONNECT_STRING=mongodb://[username]:[password]@host:port/database
```

**For Docker:** Use MongoDB connection string with service name:
```
MONGODB_CONNECT_STRING=mongodb://username:password@mongodb:27017/exercises
```

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

- Create, view, edit, and delete exercise entries
- REST API for exercise data
- React-based user interface
- Full Docker containerization for production deployment
- Health monitoring endpoints
- CORS-enabled for cross-origin requests


## Screanshots

![exercise app](./frontend-react/public/Front_End.png)