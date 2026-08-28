# Environment Configuration Guide

This document explains how to configure the Exercise Tracker application for different environments.

## Overview

The application uses environment variables to configure different aspects for development, staging, and production environments. Configuration is managed through a centralized `config.mjs` module that validates required variables on startup.

## Environment Variables

### Required Variables

These variables must be set in your `.env` file or environment:

- `MONGODB_CONNECT_STRING` - MongoDB connection URL
- `JWT_SECRET` - Secret key for JWT token signing
- `PORT` - Server port (default: 3000)

### Optional Variables

These have sensible defaults but can be overridden:

- `NODE_ENV` - Environment type (development, staging, production)
- `LOG_LEVEL` - Logging level (debug, info, warn, error)
- `CORS_ORIGIN` - CORS allowed origin (default: *)
- `JWT_EXPIRES_IN` - JWT token expiration (default: 7d)
- `JAEGER_HOST` - Hostname of the Jaeger collector (default: localhost)
- `JAEGER_OTLP_PORT` - Jaeger's OTLP/HTTP receiver port (default: 4318). Tracing silently
  disables itself if the endpoint is unreachable — this is never required for the app to start.

## Environment Setups

### Development

For local development with Docker Compose:

```bash
cp backend-rest/.env.development backend-rest/.env
docker-compose up
```

**Or** for local development without Docker:

```bash
# Copy example file
cp backend-rest/.env.development backend-rest/.env

# Update with your local MongoDB connection
nano backend-rest/.env
```

Development settings:
- `NODE_ENV=development`
- `LOG_LEVEL=debug` (verbose logging)
- `CORS_ORIGIN=*` (allow all origins)
- Local or Docker MongoDB

### Staging

For staging/testing environment:

```bash
# Create .env from example
cp backend-rest/.env.staging backend-rest/.env

# Update with staging secrets
nano backend-rest/.env
```

Staging settings:
- `NODE_ENV=staging`
- `LOG_LEVEL=info`
- `CORS_ORIGIN=https://staging.example.com`
- MongoDB Atlas or managed database
- Real JWT secret (strong)

### Production

For production deployment:

**NEVER commit actual production secrets to the repository!**

Instead, use AWS Secrets Manager or environment variables:

```bash
# Option 1: AWS ECS (via task definition)
# Environment variables set in ECS task definition

# Option 2: Docker with environment file
docker run \
  -e MONGODB_CONNECT_STRING="..." \
  -e JWT_SECRET="..." \
  newsomro-a9-backend:latest
```

Production settings:
- `NODE_ENV=production`
- `LOG_LEVEL=warn` (minimal logging)
- `CORS_ORIGIN=https://example.com`
- MongoDB Atlas or AWS DocumentDB
- Strong JWT secret from secrets manager

## Secrets Management

### Local Development

Store secrets in `.env` file (never commit):

```bash
# backend-rest/.env
MONGODB_CONNECT_STRING=mongodb://...
JWT_SECRET=dev-secret-change-in-production
```

### Production (AWS)

Use AWS Secrets Manager:

```bash
# Create secret in AWS Secrets Manager
aws secretsmanager create-secret \
  --name exercise-tracker/prod \
  --secret-string '{
    "MONGODB_CONNECT_STRING": "mongodb+srv://...",
    "JWT_SECRET": "strong-random-secret"
  }'
```

Reference in ECS task definition:

```json
{
  "environment": [
    {
      "name": "NODE_ENV",
      "value": "production"
    }
  ],
  "secrets": [
    {
      "name": "MONGODB_CONNECT_STRING",
      "valueFrom": "arn:aws:secretsmanager:region:account:secret:exercise-tracker/prod:MONGODB_CONNECT_STRING::"
    },
    {
      "name": "JWT_SECRET",
      "valueFrom": "arn:aws:secretsmanager:region:account:secret:exercise-tracker/prod:JWT_SECRET::"
    }
  ]
}
```

## Environment Files

### .env.development
Development environment with Docker Compose defaults
```
NODE_ENV=development
MONGODB_CONNECT_STRING=mongodb://root:password@mongodb:27017/?authSource=admin
PORT=3000
JWT_SECRET=dev-secret-key-change-in-production
LOG_LEVEL=debug
CORS_ORIGIN=*
```

### .env.staging
Staging environment with real settings
```
NODE_ENV=staging
MONGODB_CONNECT_STRING=mongodb+srv://staging-user:password@cluster.mongodb.net/...
PORT=3000
JWT_SECRET=staging-secret-key-must-be-strong
LOG_LEVEL=info
CORS_ORIGIN=https://staging.example.com
```

### .env.production
Production environment (USE SECRETS MANAGER INSTEAD)
```
NODE_ENV=production
MONGODB_CONNECT_STRING=${MONGODB_CONNECT_STRING}
PORT=3000
JWT_SECRET=${JWT_SECRET}
LOG_LEVEL=warn
CORS_ORIGIN=https://example.com
```

## Configuration Validation

The application validates all required environment variables on startup. If a required variable is missing, the server will exit with an error:

```
Environment validation failed: Missing required environment variables: MONGODB_CONNECT_STRING, JWT_SECRET
```

To fix:
1. Ensure all required variables are in your `.env` file
2. Verify values are not empty strings
3. Restart the application

## Configuration Access

Application code accesses configuration through the centralized `config` module:

```javascript
import { config } from './config.mjs';

// Access configuration
console.log(config.port);              // 3000
console.log(config.mongodb.url);       // mongodb://...
console.log(config.jwt.secret);        // secret-key
console.log(config.isDevelopment);     // true/false
console.log(config.isProduction);      // true/false
```

## Best Practices

1. **Never commit secrets** - Always use `.env` (in `.gitignore`)
2. **Use strong secrets in production** - Generate with: `openssl rand -base64 32`
3. **Rotate secrets regularly** - Update JWT_SECRET and database passwords
4. **Use separate credentials per environment** - Never share production secrets with dev/staging
5. **Document required variables** - Update `.env.example` when adding new variables
6. **Validate on startup** - The app validates all required variables before starting

## Environment Variable Checklist

### For Development
- [ ] `.env` file created from `.env.development`
- [ ] `MONGODB_CONNECT_STRING` points to local/Docker MongoDB
- [ ] `JWT_SECRET` set (can be simple string in dev)
- [ ] `PORT` is available (default 3000)

### For Staging
- [ ] `.env` file has staging values
- [ ] `MONGODB_CONNECT_STRING` points to staging database
- [ ] `JWT_SECRET` is strong random string
- [ ] `CORS_ORIGIN` set to staging domain
- [ ] `LOG_LEVEL` is "info"

### For Production
- [ ] Use AWS Secrets Manager for credentials
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` set to production domain only
- [ ] `LOG_LEVEL` is "warn"
- [ ] No secrets in `.env` file
- [ ] No `.env` file committed to repository

## Troubleshooting

**Error: Missing required environment variables**
- Check `.env` file exists
- Verify all required variables are set
- Ensure variables are not empty strings
- Restart the application

**JWT Token errors**
- Verify `JWT_SECRET` is the same on all servers
- Check `JWT_SECRET` hasn't been changed mid-request
- Check token hasn't expired (`JWT_EXPIRES_IN`)

**Database connection errors**
- Verify `MONGODB_CONNECT_STRING` is correct
- Check MongoDB service is running
- Verify credentials are correct for Atlas
- Check IP whitelist in MongoDB Atlas (if used)

**CORS errors**
- Verify `CORS_ORIGIN` matches your frontend URL
- In development, `CORS_ORIGIN=*` allows all origins
- In production, set to specific domain only

---

**Last Updated:** 2026-08-27
