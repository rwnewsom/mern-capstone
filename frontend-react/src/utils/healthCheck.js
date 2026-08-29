import { API_BASE_URL } from './api';

const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds

export const checkBackendHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        isHealthy: false,
        statusCode: response.status,
        message: 'Backend health check failed',
      };
    }

    const health = await response.json();
    return {
      isHealthy: health.status === 'healthy',
      statusCode: response.status,
      message: health.status,
      ...health,
    };
  } catch (error) {
    return {
      isHealthy: false,
      statusCode: 0,
      message: error.name === 'AbortError' ? 'Health check timeout' : 'Backend unreachable',
      error: error.message,
    };
  }
};

export const getBackendMetrics = async (token) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/metrics`, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: 'Failed to retrieve metrics',
      };
    }

    const metrics = await response.json();
    return {
      success: true,
      statusCode: response.status,
      ...metrics,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 0,
      message: error.name === 'AbortError' ? 'Metrics request timeout' : 'Cannot retrieve metrics',
      error: error.message,
    };
  }
};
