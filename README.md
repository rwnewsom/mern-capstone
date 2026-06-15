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

- Node.js and npm installed
- A MongoDB Atlas connection string

## Setup

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
   - Update the MongoDB connection string in backend-rest/.env
   - Make sure PORT is set as needed

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

Run backend tests with:
```bash
cd backend-rest
npm test
```

This uses Node's built-in test runner and exercises the backend validation logic.

## Features

- Create, view, edit, and delete exercise entries
- REST API for exercise data
- React-based user interface
