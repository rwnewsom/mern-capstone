import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleApiError } from '../utils/api';

describe('API Utilities', () => {
  describe('handleApiError', () => {
    it('handles network failure errors', () => {
      const error = new TypeError('Failed to fetch');
      const result = handleApiError(error);

      expect(result).toContain('Unable to connect to the server');
    });

    it('handles timeout errors', () => {
      const error = new Error('Request timeout after 15000ms');
      const result = handleApiError(error);

      expect(result).toContain('Request took too long');
    });

    it('returns error message for generic errors', () => {
      const testMessage = 'Something went wrong';
      const error = new Error(testMessage);
      const result = handleApiError(error);

      expect(result).toBe(testMessage);
    });

    it('returns default message when error has no message', () => {
      const error = new Error();
      const result = handleApiError(error);

      expect(result).toContain('unexpected error occurred');
    });

    it('handles connection refused errors', () => {
      const error = new TypeError('Failed to fetch');
      const result = handleApiError(error);

      expect(result).toContain('Unable to connect');
    });

    it('preserves custom error messages', () => {
      const customMessage = 'Custom API error message';
      const error = new Error(customMessage);
      const result = handleApiError(error);

      expect(result).toBe(customMessage);
    });
  });
});
