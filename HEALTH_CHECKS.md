# Health Checks & Monitoring

This document describes the health check and monitoring capabilities of the Exercise Tracker application.

## Overview

The application provides comprehensive health checks and metrics endpoints for monitoring service status and performance. These endpoints are essential for:

- Container orchestration (Docker, Kubernetes, ECS) health checks
- Load balancer health verification
- Monitoring and observability
- Performance tracking
- Debugging production issues

## Health Check Endpoint

### GET /health

Returns the overall health status of the application including database connectivity.

**Request:**
```bash
curl http://localhost:3000/health
```

**Response (Healthy - 200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-08-27T10:30:45.123Z",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Connected"
    }
  },
  "responseTime": 5
}
```

**Response (Degraded - 503):**
```json
{
  "status": "degraded",
  "timestamp": "2026-08-27T10:30:45.123Z",
  "checks": {
    "database": {
      "status": "unhealthy",
      "message": "Disconnected"
    }
  },
  "responseTime": 8
}
```

### Status Meanings

- **healthy**: All checks pass, service is fully operational
- **degraded**: Some checks fail, service is partially operational
- **unhealthy**: Critical failures, service should not receive traffic

### Database Check

The health endpoint includes a database connectivity check that returns:

- `Connected` (readyState = 1): MongoDB connection is active
- `Connecting` (readyState = 2): MongoDB connection in progress
- `Disconnecting` (readyState = 3): MongoDB connection closing
- `Disconnected` (readyState = 0 or other): No MongoDB connection

## Metrics Endpoint

### GET /metrics

Returns detailed performance metrics and request statistics. **No authentication required**.

**Request:**
```bash
curl http://localhost:3000/metrics
```

**Response:**
```json
{
  "uptime": 3600,
  "requests": {
    "total": 1234,
    "byStatus": {
      "200": 1100,
      "201": 50,
      "400": 30,
      "401": 20,
      "404": 34
    },
    "byMethod": {
      "GET": 600,
      "POST": 300,
      "PUT": 200,
      "DELETE": 134
    },
    "byPath": {
      "/exercises": 400,
      "/health": 300,
      "/auth/login": 200,
      "/auth/register": 150,
      "/users": 184
    }
  },
  "errors": {
    "total": 84,
    "by4xx": 84,
    "by5xx": 0
  },
  "responseTimes": {
    "average": 45,
    "min": 5,
    "max": 2500,
    "total": 55620,
    "count": 1234
  },
  "startTime": "2026-08-27T10:00:00.000Z"
}
```

### Metrics Fields

**Uptime**
- `uptime`: Server uptime in seconds since startup

**Requests**
- `total`: Total number of requests processed
- `byStatus`: Request count grouped by HTTP status code
- `byMethod`: Request count grouped by HTTP method (GET, POST, PUT, DELETE)
- `byPath`: Request count grouped by API endpoint path

**Errors**
- `total`: Total number of error responses (4xx and 5xx)
- `by4xx`: Count of client errors (400-499)
- `by5xx`: Count of server errors (500-599)

**Response Times**
- `average`: Average response time in milliseconds
- `min`: Minimum response time
- `max`: Maximum response time
- `total`: Sum of all response times
- `count`: Total number of responses measured

## Using Health Checks

### Docker Health Checks

In `docker-compose.yml`:

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Kubernetes Liveness & Readiness Probes

In Kubernetes manifest:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: exercise-tracker
spec:
  containers:
  - name: backend
    image: exercise-tracker:latest
    livenessProbe:
      httpGet:
        path: /health
        port: 3000
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /health
        port: 3000
      initialDelaySeconds: 10
      periodSeconds: 5
```

### AWS ECS Task Definition

In ECS task definition JSON:

```json
{
  "healthCheck": {
    "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
    "interval": 30,
    "timeout": 5,
    "retries": 3,
    "startPeriod": 60
  }
}
```

### Load Balancer Configuration

Most load balancers support HTTP health checks:

```bash
# Health check path
GET /health

# Success criteria
Status Code: 200-299

# Failure criteria
Status Code: 5xx or timeout

# Check interval: 30 seconds
# Check timeout: 5 seconds
# Unhealthy threshold: 3 checks
```

## Frontend Health Verification

The frontend includes utilities to check backend connectivity:

### Basic Health Check

```javascript
import { checkBackendHealth } from './utils/healthCheck.js';

const health = await checkBackendHealth();
if (health.isHealthy) {
  console.log('Backend is available');
} else {
  console.log('Backend is unavailable:', health.message);
}
```

### Response Format

```javascript
{
  isHealthy: true,
  statusCode: 200,
  message: "healthy",
  status: "healthy",
  timestamp: "2026-08-27T10:30:45.123Z",
  checks: {
    database: {
      status: "healthy",
      message: "Connected"
    }
  },
  responseTime: 5
}
```

### Retrieving Metrics (Authenticated)

```javascript
import { getBackendMetrics } from './utils/healthCheck.js';

const token = localStorage.getItem('authToken');
const metrics = await getBackendMetrics(token);

if (metrics.success) {
  console.log('Uptime:', metrics.uptime, 'seconds');
  console.log('Total requests:', metrics.requests.total);
  console.log('Average response time:', metrics.responseTimes.average, 'ms');
} else {
  console.log('Failed to retrieve metrics:', metrics.message);
}
```

## Monitoring Best Practices

### Alert Thresholds

Configure alerts for:

- **Health endpoint returns degraded or timeout** → Page on-call engineer
- **Error rate > 5%** (errors.total / requests.total) → Page on-call engineer
- **Average response time > 500ms** → Alert for investigation
- **5xx errors increasing** → Escalate immediately

### Metrics Interpretation

**High request volume with low errors:**
- Normal operation, healthy scaling

**High error rate (4xx > 10%):**
- Possible client misconfiguration or API changes
- Check request logs for patterns

**High error rate (5xx > 1%):**
- Server issues, database problems, or code bugs
- Immediate investigation required

**Response time increasing:**
- Database performance degradation
- High load conditions
- Check database query metrics

**Database check failing:**
- Connection pool exhausted
- MongoDB unavailable
- Network connectivity issues

## Logging Integration

All requests are logged with structured JSON logging including:

- `method`: HTTP method (GET, POST, etc.)
- `path`: Request path
- `statusCode`: HTTP response status
- `duration_ms`: Request duration in milliseconds
- `ip`: Client IP address

### Example Log Entry

```json
{
  "timestamp": "2026-08-27T10:30:45.123Z",
  "level": "info",
  "message": "request",
  "method": "GET",
  "path": "/health",
  "statusCode": 200,
  "duration_ms": 5,
  "ip": "127.0.0.1"
}
```

## Testing Health Checks

### Local Testing

```bash
# Check health
curl http://localhost:3000/health

# Get metrics
curl http://localhost:3000/metrics

# Check health with jq (pretty JSON)
curl http://localhost:3000/health | jq .

# Follow metrics updates
watch -n 5 'curl -s http://localhost:3000/metrics | jq .'
```

### Docker Testing

```bash
# Check if container passes health check
docker ps --filter "name=backend" --format "table {{.Names}}\t{{.Status}}"

# View health check history
docker ps --no-trunc --format "table {{.Names}}\t{{.Status}}" | grep backend

# Test health endpoint through container
docker-compose exec backend curl http://localhost:3000/health
```

### Production Monitoring

```bash
# Monitor metrics in production
watch -n 10 'curl -s https://api.example.com/metrics | jq .responseTimes'

# Alert on high error rate
curl -s https://api.example.com/metrics | jq \
  '(.errors.total / .requests.total * 100) as $error_rate | 
   if $error_rate > 5 then "ALERT: Error rate at \($error_rate)%" else "OK" end'
```

## Metrics Retention

**Current behavior:**
- Metrics reset on server restart
- Uptime and request counts accumulate since last restart

**For persistent metrics storage** (future enhancement):
- Implement metrics export to Prometheus or CloudWatch
- Store metrics in time-series database
- Implement metric retention policies

## Performance Impact

Health check and metrics endpoints have minimal performance impact:

- Health checks: ~5ms (database connectivity check)
- Metrics recording: <1ms per request (in-memory tracking)
- Metrics endpoint: ~2ms (read-only operation)

## Security Considerations

### /health Endpoint
- **Public**: No authentication required (needed for load balancers)
- **CORS**: Enabled for frontend access
- **Safe**: Read-only, no data exposure

### /metrics Endpoint
- **Public**: No authentication required (standard practice)
- **Information disclosure**: Contains aggregate metrics only
- **CORS**: Enabled for frontend access
- **Recommendation**: In production, restrict to internal networks if concerned

### Sensitive Information

The `/metrics` endpoint does not expose:
- User data
- Exercise details
- API keys or secrets
- Database connection strings
- File paths or configuration

---

**Last Updated:** 2026-08-27

**Related Documentation:**
- [Environment Configuration](ENVIRONMENT.md)
- [README](README.md)
- [Docker Setup](docker-compose.yml)
