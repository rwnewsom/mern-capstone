import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.stubGlobal('console', {
      error: vi.fn(),
      log: vi.fn(),
      warn: vi.fn(),
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
    // Regression test: the component used to check process.env.NODE_ENV,
    // which Vite never defines in browser code — reading it there throws
    // ReferenceError, crashing this exact fallback UI. import.meta.env.DEV
    // is Vite's real equivalent, and (unlike process.env.NODE_ENV) it's
    // actually true here under Vitest too, so this assertion isn't
    // silently skipped the way the old guard was.
    expect(import.meta.env.DEV).toBe(true);

    const testError = 'Development error details';
    const ThrowError = () => {
      throw new Error(testError);
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Rendered via error.toString(), which is "Error: <message>" —
    // this exact mismatch was also hidden by the old skipped assertion.
    expect(screen.getByText(`Error: ${testError}`)).toBeInTheDocument();
  });
});
