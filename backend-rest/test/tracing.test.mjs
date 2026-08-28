import test from 'node:test';
import assert from 'node:assert';

test('Tracing Module', async (t) => {
  const { initTracing, shutdownTracing } = await import('../tracing.mjs');

  await t.test('initTracing is a function', () => {
    assert.strictEqual(typeof initTracing, 'function');
  });

  await t.test('shutdownTracing is a function', () => {
    assert.strictEqual(typeof shutdownTracing, 'function');
  });

  await t.test('initTracing returns a usable Tracer', () => {
    const tracer = initTracing('test-service');
    assert(tracer);
    assert.strictEqual(typeof tracer.startSpan, 'function');
  });

  await t.test('tracer produces spans with the expected API', () => {
    const tracer = initTracing('test-service');
    const span = tracer.startSpan('test-span');
    assert.strictEqual(typeof span.setAttributes, 'function');
    assert.strictEqual(typeof span.recordException, 'function');
    assert.strictEqual(typeof span.end, 'function');
    span.setAttributes({ 'test.attribute': 'value' });
    span.end();
  });

  await t.test('initTracing is idempotent (safe to call repeatedly)', () => {
    const tracerA = initTracing('service-a');
    const tracerB = initTracing('service-b');
    assert(tracerA);
    assert(tracerB);
  });

  await t.test(
    'shutdownTracing resolves without throwing even when the collector is unreachable',
    async () => {
      // No Jaeger/OTLP collector is running in the test environment, so this
      // exercises the graceful-degradation path (bounded by tracing.mjs's
      // short timeoutMillis/forceFlushTimeoutMillis) rather than a real flush.
      await assert.doesNotReject(shutdownTracing());
    }
  );
});
