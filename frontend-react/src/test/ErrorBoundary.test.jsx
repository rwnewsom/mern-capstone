import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.stubGlobal('console', {
      error: vi.fn(),
      log: vi.fn(),
      warn: vi.fn()
    });
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays error message when child component throws', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  it('displays reload button in error state', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Reload/i)).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    const testError = 'Development error details';
    const ThrowError = () => {
      throw new Error(testError);
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    if (process.env.NODE_ENV === 'development') {
      expect(screen.getByText(testError)).toBeInTheDocument();
    }
  });
});
