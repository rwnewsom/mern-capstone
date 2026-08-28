# Graceful Shutdown

This document describes how the Exercise Tracker application handles graceful shutdown for container orchestration systems.

## Overview

Graceful shutdown is critical for containerized deployments in Docker, Kubernetes, and AWS ECS. When a container is told to shutdown, the application must:

1. Stop accepting new connections
2. Complete in-flight requests
3. Close database connections cleanly
4. Release resources
5. Exit with appropriate status codes

## How It Works

### Signal Handling

The application listens for two shutdown signals:

- **SIGTERM** — Normal shutdown signal from container orchestrators
- **SIGINT** — Interrupt signal (Ctrl+C in development)

### Shutdown Process

When a shutdown signal is received:

```
1. Receive SIGTERM/SIGINT
   ↓
2. Stop accepting new connections (close HTTP server)
   ↓
3. Track active requests with timeout (30 seconds)
   ↓
4. Flush buffered trace spans (bounded to 5 seconds; skipped if tracing never initialized)
   ↓
5. Close MongoDB connection
   ↓
6. Exit with status code (0=success, 1=failure)
```

### Request Tracking

The `trackRequest` middleware monitors active HTTP requests:

- Increments counter when request starts
- Decrements counter when response finishes or closes
- Allows graceful shutdown to wait for request completion

### Timeout Handling

If shutdown takes longer than 30 seconds:

```
- Log warning message
- Force close database connection
- Exit with status code 1 (error)
```

This prevents containers from hanging indefinitely.

## Implementation Details

### Module: graceful_shutdown.mjs

**Exports:**

- `trackRequest` — Express middleware to track active requests
- `setupGracefulShutdown(server)` — Configure shutdown handlers
- `activeRequests` — Current count of active requests (exported for monitoring)

**Behavior:**

```javascript
import { trackRequest, setupGracefulShutdown } from './graceful_shutdown.mjs';

app.use(trackRequest); // Track every request

const server = app.listen(PORT, async () => {
  await exercises.connect();
  logger.info('Server started', { port: PORT });
});

setupGracefulShutdown(server); // Handle SIGTERM/SIGINT
```

### Uncaught Exception Handling

In addition to signal handling, graceful shutdown also catches:

- **Uncaught Exceptions** — Unhandled errors in synchronous code
- **Unhandled Promise Rejections** — Unhandled errors in async code

Both exit with status code 1 to signal failure to the container orchestrator.

## Container Orchestration Integration

### Docker

**docker-compose.yml** — Shutdown configuration:

```yaml
services:
  backend:
    stop_grace_period: 45s  # Wait 45s for graceful shutdown
    environment:
      - PORT=3000
```

**Dockerfile** — Use exec form for proper signal handling:

```dockerfile
# Good: Signals forwarded to Node process
ENTRYPOINT ["node", "exercise_controller.mjs"]

# Bad: Signals go to shell, not Node
CMD node exercise_controller.mjs
```

### Kubernetes

**Pod Spec** — Graceful shutdown configuration:

```yaml
apiVersion: v1
kind: Pod
spec:
  terminationGracePeriodSeconds: 45  # Wait 45s for shutdown
  containers:
  - name: backend
    image: exercise-tracker:latest
    lifecycle:
      preStop:
        exec:
          command: ["/bin/sleep", "5"]  # Allow time for load balancer updates
```

When Kubernetes terminates a pod:
1. Sends SIGTERM to container
2. Waits for `terminationGracePeriodSeconds` (45s default)
3. Sends SIGKILL if not exited by then

### AWS ECS

**Task Definition** — Shutdown configuration:

```json
{
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "exercise-tracker:latest",
      "stopTimeout": 45,
      "essential": true
    }
  ]
}
```

ECS behavior:
1. Sends SIGTERM when stopping task
2. Waits for `stopTimeout` (45 seconds)
3. Sends SIGKILL if still running after timeout

### Load Balancer Draining

Modern load balancers support connection draining:

- **AWS ALB** — Deregistration delay (default 300s)
- **Nginx** — `keepalive_timeout` with graceful shutdown
- **HAProxy** — `soft-stop` mode

Configuration (AWS ALB):

```
Target Group → Attributes → Deregistration delay = 45 seconds
```

When instance is marked for removal:
1. Stop sending new requests
2. Wait for existing connections to complete
3. Remove from load balancer

## Log Output Examples

### Graceful Shutdown (Success)

```
info: Received SIGTERM, starting graceful shutdown
info: HTTP server closed
info: Waiting for 3 active request(s) to complete
info: Waiting for 2 active request(s) to complete
info: Waiting for 1 active request(s) to complete
info: All requests completed
info: Closing database connection
info: Database connection closed
(exit code 0)
```

### Graceful Shutdown (Timeout)

```
info: Received SIGTERM, starting graceful shutdown
info: HTTP server closed
info: Waiting for 5 active request(s) to complete
info: Waiting for 5 active request(s) to complete
warn: Shutdown timeout after 30000ms, forcing exit
error: Error closing database connection
(exit code 1)
```

### Uncaught Exception

```
error: Uncaught exception, initiating shutdown
error: ReferenceError: undefined variable
(exit code 1)
```

## Testing Graceful Shutdown

### Docker Testing

**Test graceful shutdown locally:**

```bash
# Start container
docker-compose up

# In another terminal, trigger graceful shutdown
docker-compose stop --timeout=45

# Watch logs
docker-compose logs -f backend
```

**Timeout testing:**

```bash
# Kill before timeout
docker-compose stop --timeout=5  # Should force kill

# Check exit code
docker-compose ps  # Exit status in STATUS column
```

### Kubernetes Testing

**Test graceful shutdown on cluster:**

```bash
# Deploy pod
kubectl apply -f deployment.yaml

# Watch for shutdown
kubectl logs -f pod/exercise-tracker

# Delete pod and observe shutdown
kubectl delete pod exercise-tracker
kubectl logs exercise-tracker
```

### Manual Signal Testing

**In development, test signals:**

```bash
# Start server
node backend-rest/exercise_controller.mjs

# In another terminal, send SIGTERM
kill -TERM $(pgrep -f exercise_controller)

# Watch graceful shutdown logs
```

**Simulate slow requests:**

```bash
# Start server
node backend-rest/exercise_controller.mjs

# Make a slow request (in another terminal)
curl -X GET http://localhost:3000/health & sleep 2 && kill -TERM $(pgrep -f exercise_controller)

# Server waits for request to complete
```

## Best Practices

### Timeout Configuration

Set container timeout **higher** than application timeout:

- **Application timeout** (graceful_shutdown.mjs): 30 seconds
- **Container timeout** (Docker/K8s): 45 seconds
- **Load balancer timeout** (ALB): 60 seconds

This gives the application time to shutdown before the container forces kill.

### Health Checks During Shutdown

Don't modify `/health` endpoint during shutdown. Instead:

1. Continue returning healthy status during graceful shutdown
2. Load balancers already stop sending requests after SIGTERM
3. Returning degraded status may cause upstream issues

### Database Connection Cleanup

The application properly closes MongoDB:

- Waits for current operations to finish
- Closes connection pool
- Releases file descriptors

Never force-close connections as this can:
- Corrupt transaction state
- Leave locks held
- Cause data inconsistency

### Request Timeouts

Long-running requests may not complete within shutdown timeout:

```javascript
// Example: Long-running operation
const result = await slowDatabaseQuery(); // Takes 2 minutes

// Solution: Set appropriate timeouts
const timeout = 30000; // 30 seconds
const result = await Promise.race([
  slowDatabaseQuery(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), timeout)
  )
]);
```

### Logging During Shutdown

All shutdown events are logged for observability:

```json
{
  "timestamp": "2026-08-27T10:30:45.123Z",
  "level": "info",
  "message": "Received SIGTERM, starting graceful shutdown"
}
```

These logs help debug deployment issues and container orchestration problems.

## Monitoring Graceful Shutdown

### Metrics to Track

Monitor these metrics to detect graceful shutdown issues:

- **Shutdown time** — How long does shutdown take?
- **Active requests at shutdown** — Requests in-flight when SIGTERM received
- **Request completion rate** — % of requests completing before timeout
- **Error rate during shutdown** — Errors during graceful shutdown phase

### Alerting Rules

Set alerts for:

- **Shutdown exceeds 30 seconds** — May indicate stuck connections
- **Uncaught exceptions** — Unexpected errors during shutdown
- **Multiple SIGTERM signals** — May indicate orchestrator issues

### Container Restart Loops

If containers restart constantly, check:

1. Is graceful shutdown completing?
   ```bash
   docker logs <container> | grep "graceful"
   ```

2. Are requests timing out?
   ```bash
   docker logs <container> | grep "timeout"
   ```

3. Is database connection closing?
   ```bash
   docker logs <container> | grep "database"
   ```

## Common Issues

### Container Times Out During Shutdown

**Symptom:** Container exits with SIGKILL (137)

**Causes:**
- Requests taking longer than timeout
- Database operations not completing
- Infinite loops in shutdown handlers

**Fix:**
- Increase container timeout
- Optimize database queries
- Check for blocking operations

### Requests Rejected During Shutdown

**Symptom:** "Connection refused" errors when scaling down

**Causes:**
- Server closed before draining requests
- Load balancer sending requests after SIGTERM

**Fix:**
- Ensure app.listen().close() is called
- Configure load balancer connection draining
- Add small delay before shutdown (preStop hook)

### Database Connection Errors

**Symptom:** "Connection pool closed" errors

**Causes:**
- Closing connection too early
- Not waiting for operations to complete

**Fix:**
- Graceful shutdown waits for operations
- Never force-close connection pool
- Check MongoDB connection logs

## Performance Impact

Graceful shutdown has minimal performance impact:

- **Request tracking:** <1ms per request overhead
- **Signal handling:** Only active during shutdown
- **Memory:** ~100 bytes per tracked request

## Future Enhancements

Potential improvements for graceful shutdown:

- [ ] Configurable shutdown timeout per environment
- [ ] Custom shutdown hooks for user code
- [ ] Metrics endpoint for active requests
- [ ] Load balancer deregistration integration
- [ ] Detailed shutdown event logging
- [ ] Health check behavior during shutdown

---

**Last Updated:** 2026-08-27

**Related Documentation:**
- [Health Checks & Monitoring](HEALTH_CHECKS.md)
- [Docker Setup](docker-compose.yml)
- [Environment Configuration](ENVIRONMENT.md)
