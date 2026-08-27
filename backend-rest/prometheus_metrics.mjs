import { getMetrics } from './metrics.mjs';

const formatPrometheusMetrics = () => {
  const metrics = getMetrics();
  let output = '';

  // HELP and TYPE comments for Prometheus
  output += '# HELP exercise_tracker_uptime_seconds Server uptime in seconds\n';
  output += '# TYPE exercise_tracker_uptime_seconds gauge\n';
  output += `exercise_tracker_uptime_seconds ${metrics.uptime}\n\n`;

  // HTTP Requests
  output += '# HELP http_requests_total Total HTTP requests\n';
  output += '# TYPE http_requests_total counter\n';
  output += `http_requests_total ${metrics.requests.total}\n\n`;

  // HTTP Requests by Status Code
  output += '# HELP http_requests_by_status HTTP requests grouped by status code\n';
  output += '# TYPE http_requests_by_status gauge\n';
  Object.entries(metrics.requests.byStatus).forEach(([status, count]) => {
    output += `http_requests_by_status{status="${status}"} ${count}\n`;
  });
  output += '\n';

  // HTTP Requests by Method
  output += '# HELP http_requests_by_method HTTP requests grouped by method\n';
  output += '# TYPE http_requests_by_method gauge\n';
  Object.entries(metrics.requests.byMethod).forEach(([method, count]) => {
    output += `http_requests_by_method{method="${method}"} ${count}\n`;
  });
  output += '\n';

  // HTTP Requests by Path (top paths only to avoid cardinality explosion)
  output += '# HELP http_requests_by_path HTTP requests grouped by path\n';
  output += '# TYPE http_requests_by_path gauge\n';
  const sortedPaths = Object.entries(metrics.requests.byPath)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20); // Top 20 paths
  sortedPaths.forEach(([path, count]) => {
    const safePath = path.replace(/"/g, '\\"');
    output += `http_requests_by_path{path="${safePath}"} ${count}\n`;
  });
  output += '\n';

  // Error Metrics
  output += '# HELP http_errors_total Total HTTP errors (4xx and 5xx)\n';
  output += '# TYPE http_errors_total gauge\n';
  output += `http_errors_total ${metrics.errors.total}\n`;
  output += `http_errors_4xx_total ${metrics.errors.by4xx}\n`;
  output += `http_errors_5xx_total ${metrics.errors.by5xx}\n\n`;

  // Response Times
  output += '# HELP http_response_time_ms HTTP response time in milliseconds\n';
  output += '# TYPE http_response_time_ms summary\n';
  output += `http_response_time_ms_count ${metrics.responseTimes.count}\n`;
  output += `http_response_time_ms_sum ${metrics.responseTimes.total}\n`;
  output += `http_response_time_ms{quantile="0"} ${metrics.responseTimes.min}\n`;
  output += `http_response_time_ms{quantile="1"} ${metrics.responseTimes.max}\n`;
  output += `http_response_time_ms{quantile="0.5"} ${metrics.responseTimes.average}\n\n`;

  // Error Rate
  const errorRate =
    metrics.requests.total > 0
      ? ((metrics.errors.total / metrics.requests.total) * 100).toFixed(2)
      : 0;
  output += '# HELP http_error_rate_percent HTTP error rate as percentage\n';
  output += '# TYPE http_error_rate_percent gauge\n';
  output += `http_error_rate_percent ${errorRate}\n`;

  return output;
};

export { formatPrometheusMetrics };
