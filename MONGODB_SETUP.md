# MongoDB Setup Guide

This guide covers all three ways to set up MongoDB for the Exercise Tracker application.

## Quick Start

**Don't know which option to choose?**
- 🚀 **Fastest:** Use Docker Compose (run from project root: `docker-compose up`)
- 💻 **Most Control:** Install MongoDB locally
- ☁️ **Cloud-Ready:** Use MongoDB Atlas

---

## Option 1: Docker Compose (Recommended)

### Overview
Docker Compose includes everything - backend, frontend, and a local MongoDB database. No separate installations needed.

### Prerequisites
- Docker Desktop installed and running
- ~5 minutes setup time

### Setup

1. **From project root, run:**
   ```bash
   docker-compose up --build
   ```

2. **First run setup (automatic):**
   - Downloads MongoDB 7 image
   - Creates MongoDB container with data volume
   - Sets up authentication (root:password)
   - Initializes database connection

3. **Verify it's working:**
   - Frontend: `http://localhost`
   - Backend API: `http://localhost:3000`
   - Backend health: `http://localhost:3000/health`

### Usage

**Start services:**
```bash
docker-compose up
```

**Start in background:**
```bash
docker-compose up -d
```

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mongodb
```

**Stop services:**
```bash
docker-compose down
```

**Reset database (delete all data):**
```bash
docker-compose down -v
docker-compose up --build
```

### Connection Details (Docker)
- **Connection String:** `mongodb://root:password@mongodb:27017/?authSource=admin`
- **Database:** `exercise-tracker`
- **Port:** `27017` (internal to Docker network)
- **Host:** `mongodb` (Docker service name)

### Troubleshooting

**MongoDB service fails to start:**
- Check Docker resources (CPU/Memory)
- View MongoDB logs: `docker-compose logs mongodb`
- Ensure port 27017 isn't already in use

**Backend can't connect to MongoDB:**
- Verify MongoDB is healthy: `docker-compose ps`
- Check connection string in backend .env
- Restart services: `docker-compose restart`

---

## Option 2: Local MongoDB

### Overview
Install and run MongoDB directly on your machine. Gives you full control and visibility.

### Prerequisites
- Node.js 20+ and npm
- ~15 minutes setup time
- MongoDB Community Edition installed

### Installation

#### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
mongosh
```

#### Windows
1. Download from [mongodb.com/download/community](https://www.mongodb.com/download/community)
2. Run installer
3. MongoDB runs as a Windows Service by default
4. Verify: Open Command Prompt and run `mongosh`

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
```

### Configuration

1. **Create `.env` file in `backend-rest/`:**
   ```bash
   cp backend-rest/.env.example backend-rest/.env
   ```

2. **Edit `backend-rest/.env`:**
   ```env
   MONGODB_CONNECT_STRING=mongodb://localhost:27017/exercise-tracker
   PORT=3000
   JWT_SECRET=your_jwt_secret_key_here
   ```

3. **Verify MongoDB is running:**
   ```bash
   mongosh
   ```
   You should see the MongoDB shell prompt.

### Usage

**Start backend:**
```bash
cd backend-rest
npm install
npm start
```

**Start frontend (in another terminal):**
```bash
cd frontend-react
npm install
npm run dev
```

### Connection Details (Local)
- **Connection String:** `mongodb://localhost:27017/exercise-tracker`
- **Host:** `localhost`
- **Port:** `27017`
- **Database:** `exercise-tracker`
- **Authentication:** None (local development)

### Troubleshooting

**MongoDB won't start:**
```bash
# macOS - Start MongoDB service
brew services start mongodb-community

# Linux - Start MongoDB service
sudo systemctl start mongod

# Windows - Start MongoDB service
net start MongoDB
```

**Connection refused error:**
- Check MongoDB is running: `mongosh`
- Verify connection string in `.env`
- Check port 27017 isn't blocked by firewall

**Database connection timeout:**
- Restart MongoDB service
- Clear MongoDB data directory (caution: loses data)
- Check backend logs for detailed error

**View database contents:**
```bash
mongosh
> use exercise-tracker
> db.exercises.find()
> db.users.find()
```

---

## Option 3: MongoDB Atlas (Cloud)

### Overview
MongoDB's cloud service. Great for team development, production, and learning cloud databases.

### Prerequisites
- MongoDB Atlas account (free tier available)
- ~5 minutes setup time
- Internet connection required

### Setup

1. **Create Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Click "Start Free"
   - Sign up with email or Google

2. **Create a Cluster**
   - After signing in, click "Create Deployment"
   - Select "Serverless" (free tier, simplest)
   - Choose region closest to you
   - Name: `exercise-tracker` (or your preference)
   - Click "Create Deployment"

3. **Create Database User**
   - In "Security" > "Database Access"
   - Click "Add Database User"
   - Username: `exerciseuser`
   - Password: Generate secure password (save this!)
   - Click "Create Database User"

4. **Get Connection String**
   - In "Database" > Your cluster
   - Click "Connect"
   - Select "Drivers"
   - Copy connection string
   - Replace `<username>` with `exerciseuser`
   - Replace `<password>` with your password

5. **Configure Connection**
   - Create `backend-rest/.env`:
     ```bash
     cp backend-rest/.env.example backend-rest/.env
     ```
   - Edit and paste your connection string:
     ```env
     MONGODB_CONNECT_STRING=mongodb+srv://exerciseuser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     PORT=3000
     JWT_SECRET=your_jwt_secret_key_here
     ```

6. **Allow Network Access**
   - In Atlas, go to "Security" > "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (for development)
   - Click "Confirm"

7. **Test Connection**
   ```bash
   cd backend-rest
   npm install
   npm start
   ```

### Connection Details (Atlas)
- **Connection String Format:** `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`
- **Database:** `exercise-tracker` (auto-created)
- **Authentication:** Username and password required
- **Port:** 27017 (implicit in connection string)

### Best Practices

**Never commit credentials:**
- `.env` file should never be in git (already in `.gitignore`)
- Use strong passwords for Atlas user
- Regenerate password if accidentally exposed

**Production setup:**
- Use dedicated user for production (not your admin user)
- Restrict network access by IP whitelist
- Enable 2FA on Atlas account
- Monitor activity in Atlas console

### Troubleshooting

**Connection timeout:**
- Check internet connection
- Verify IP address is whitelisted in Atlas
- Wait for cluster to initialize (can take 1-2 minutes)

**Authentication failed:**
- Double-check username and password in connection string
- Verify special characters are URL-encoded (e.g., `@` → `%40`)
- Regenerate password if uncertain

**SSL certificate errors:**
- Usually means certificate validation is failing
- Ensure you have: `?retryWrites=true&w=majority` in connection string
- Update Node.js to latest version

**Connection string in Atlas console:**
```
mongodb+srv://exerciseuser:xxxxx@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## Switching Between Options

### From Docker to Local

1. **Stop Docker:**
   ```bash
   docker-compose down
   ```

2. **Start local MongoDB:**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Update `.env`:**
   ```env
   MONGODB_CONNECT_STRING=mongodb://localhost:27017/exercise-tracker
   ```

4. **Start backend:**
   ```bash
   cd backend-rest
   npm start
   ```

### From Local to Atlas

1. **Stop local MongoDB:**
   ```bash
   # macOS
   brew services stop mongodb-community
   
   # Linux
   sudo systemctl stop mongod
   ```

2. **Update `.env` with Atlas connection string:**
   ```env
   MONGODB_CONNECT_STRING=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

3. **Start backend:**
   ```bash
   cd backend-rest
   npm start
   ```

---

## Database Commands Reference

### Connect to Database

**Docker MongoDB:**
```bash
docker-compose exec mongodb mongosh -u root -p password
```

**Local MongoDB:**
```bash
mongosh
```

**Atlas MongoDB:**
```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/"
```

### Common Database Commands

```bash
# Show all databases
show dbs

# Use a database
use exercise-tracker

# Show collections
show collections

# View exercises
db.exercises.find().pretty()

# View users
db.users.find().pretty()

# Count documents
db.exercises.countDocuments()

# Delete all exercises
db.exercises.deleteMany({})

# Delete all users
db.users.deleteMany({})
```

---

## When to Use Each Option

| Scenario | Recommendation | Reason |
|----------|---|---|
| First time setting up | Docker | Fastest, no extra installs |
| Team development | Atlas | Shared database, no setup per dev |
| Learning/experimentation | Local | Full control, simple |
| Production deployment | Atlas | Professional, scalable, monitored |
| CI/CD testing | Docker | Consistent, automated |
| Offline development | Local or Docker | No internet required |

---

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB University Courses](https://university.mongodb.com/) (free)
- [Atlas Documentation](https://docs.atlas.mongodb.com/)
- [mongosh Shell Guide](https://docs.mongodb.com/mongosh/)

---

**Last Updated:** 2026-08-26
