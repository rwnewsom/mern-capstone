let tracer = null;

const initDbTracer = (otelTracer) => {
  tracer = otelTracer;
};

const traceDbOperation = async (operationName, collection, operationType, asyncFn) => {
  if (!tracer) {
    return asyncFn();
  }

  const span = tracer.startSpan(`db.${collection}.${operationType}`);
  span.setAttributes({
    'db.system': 'mongodb',
    'db.operation': operationName,
    'db.collection': collection,
    'db.mongodb.command': operationType,
  });

  try {
    const startTime = Date.now();
    const result = await asyncFn();
    const duration = Date.now() - startTime;

    span.setAttributes({
      'db.response_time_ms': duration,
    });

    span.end();
    return result;
  } catch (err) {
    span.recordException(err);
    span.setAttributes({
      'db.error': true,
      'db.error.message': err.message,
    });
    span.end();
    throw err;
  }
};

export { initDbTracer, traceDbOperation };
