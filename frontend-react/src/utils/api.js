const DEFAULT_TIMEOUT = 15000; // 15 seconds

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const fetchWithTimeout = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const authHeader = getAuthHeader();
    const headers = { ...authHeader, ...options.headers };

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      window.location.href = '/login';
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
};

export const handleApiError = (error) => {
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return 'Unable to connect to the server. Please check your connection.';
  }
  if (error.message.includes('timeout')) {
    return 'Request took too long. Please try again.';
  }
  return error.message || 'An unexpected error occurred.';
};
