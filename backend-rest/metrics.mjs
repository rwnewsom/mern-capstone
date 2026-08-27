const metrics = {
  requests: {
    total: 0,
    byStatus: {},
    byMethod: {},
    byPath: {},
  },
  errors: {
    total: 0,
    by4xx: 0,
    by5xx: 0,
  },
  responseTimes: {
    total: 0,
    count: 0,
    min: Infinity,
    max: 0,
  },
  startTime: new Date().toISOString(),
};

const recordRequest = (method, path, statusCode, responseTime) => {
  metrics.requests.total += 1;

  if (!metrics.requests.byStatus[statusCode]) {
    metrics.requests.byStatus[statusCode] = 0;
  }
  metrics.requests.byStatus[statusCode] += 1;

  if (!metrics.requests.byMethod[method]) {
    metrics.requests.byMethod[method] = 0;
  }
  metrics.requests.byMethod[method] += 1;

  if (!metrics.requests.byPath[path]) {
    metrics.requests.byPath[path] = 0;
  }
  metrics.requests.byPath[path] += 1;

  if (statusCode >= 400) {
    metrics.errors.total += 1;
    if (statusCode < 500) {
      metrics.errors.by4xx += 1;
    } else {
      metrics.errors.by5xx += 1;
    }
  }

  metrics.responseTimes.total += responseTime;
  metrics.responseTimes.count += 1;
  metrics.responseTimes.min = Math.min(metrics.responseTimes.min, responseTime);
  metrics.responseTimes.max = Math.max(metrics.responseTimes.max, responseTime);
};

const getAverageResponseTime = () => {
  if (metrics.responseTimes.count === 0) {
    return 0;
  }
  return Math.round(metrics.responseTimes.total / metrics.responseTimes.count);
};

const getMetrics = () => {
  return {
    uptime: Math.round((Date.now() - new Date(metrics.startTime).getTime()) / 1000),
    requests: metrics.requests,
    errors: metrics.errors,
    responseTimes: {
      average: getAverageResponseTime(),
      min: metrics.responseTimes.min === Infinity ? 0 : metrics.responseTimes.min,
      max: metrics.responseTimes.max,
      total: metrics.responseTimes.total,
      count: metrics.responseTimes.count,
    },
    startTime: metrics.startTime,
  };
};

const resetMetrics = () => {
  metrics.requests = {
    total: 0,
    byStatus: {},
    byMethod: {},
    byPath: {},
  };
  metrics.errors = {
    total: 0,
    by4xx: 0,
    by5xx: 0,
  };
  metrics.responseTimes = {
    total: 0,
    count: 0,
    min: Infinity,
    max: 0,
  };
  metrics.startTime = new Date().toISOString();
};

export { recordRequest, getMetrics, resetMetrics };
