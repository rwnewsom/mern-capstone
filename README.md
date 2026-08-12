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

### GET /health
Health check endpoint for monitoring service status.

**Response:**
```json
{ "status": "ok" }
```

### GET /exercises
Retrieve all exercises.

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
  }
]
```

### POST /exercises
Create a new exercise.

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

**Valid Units:** `kgs`, `lbs`, `miles`

### PUT /exercises/:id
Update an existing exercise by ID.

### DELETE /exercises/:id
Delete an exercise by ID.

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