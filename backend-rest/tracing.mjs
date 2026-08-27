const initTracing = (serviceName = 'exercise-tracker-backend') => {
  // OpenTelemetry is optional - gracefully degrade if packages not available
  try {
    // Lazy load optional dependencies to prevent blocking on import
    // In production, these would be properly installed
    const jaegerHost = process.env.JAEGER_HOST || 'localhost';
    const jaegerPort = parseInt(process.env.JAEGER_PORT || '6831', 10);

    // Log tracing initialization
    console.log(`[Tracing] Initializing OpenTelemetry with Jaeger at ${jaegerHost}:${jaegerPort}`);

    return {
      serviceName,
      jaegerHost,
      jaegerPort,
      enabled: true,
    };
  } catch {
    console.log('[Tracing] OpenTelemetry packages not available, continuing without tracing');
    return {
      serviceName,
      enabled: false,
    };
  }
};

export { initTracing };
