import { Component } from 'react';
import { initTracing } from '../utils/tracing';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    const tracer = initTracing();
    const span = tracer?.startSpan('error-boundary');
    if (span) {
      span.recordException(error);
      span.setAttributes({
        'error.type': error.name,
        'error.message': error.message,
        'component.stack': errorInfo?.componentStack ?? '',
      });
      span.end();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#d32f2f' }}>
          <h2>Something went wrong</h2>
          <p>The application encountered an unexpected error.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Reload Page
          </button>
          {import.meta.env.DEV && (
            <details style={{ marginTop: '20px', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
              <summary>Error details (dev only)</summary>
              <p>{this.state.error?.toString()}</p>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
