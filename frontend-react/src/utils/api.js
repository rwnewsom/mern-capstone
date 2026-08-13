const DEFAULT_TIMEOUT = 15000; // 15 seconds

export const fetchWithTimeout = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
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
