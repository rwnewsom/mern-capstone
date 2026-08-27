import test from 'node:test';
import assert from 'node:assert';

test('Tracing Module', async (t) => {
  const { initTracing } = await import('../tracing.mjs');

  await t.test('initTracing is a function', () => {
    assert.strictEqual(typeof initTracing, 'function');
  });

  await t.test('initTracing returns tracing configuration object', () => {
    const config = initTracing();
    assert(config);
    assert(typeof config === 'object');
    assert('serviceName' in config);
    assert('enabled' in config);
  });

  await t.test('initTracing accepts custom service name', () => {
    const config = initTracing('custom-service');
    assert.strictEqual(config.serviceName, 'custom-service');
  });

  await t.test('initTracing defaults service name to exercise-tracker-backend', () => {
    const config = initTracing();
    assert.strictEqual(config.serviceName, 'exercise-tracker-backend');
  });

  await t.test('initTracing uses JAEGER_HOST from environment', () => {
    const originalHost = process.env.JAEGER_HOST;
    try {
      process.env.JAEGER_HOST = 'custom-jaeger-host';
      const config = initTracing();
      assert.strictEqual(config.jaegerHost, 'custom-jaeger-host');
    } finally {
      if (originalHost !== undefined) {
        process.env.JAEGER_HOST = originalHost;
      } else {
        delete process.env.JAEGER_HOST;
      }
    }
  });

  await t.test('initTracing uses JAEGER_PORT from environment', () => {
    const originalPort = process.env.JAEGER_PORT;
    try {
      process.env.JAEGER_PORT = '9999';
      const config = initTracing();
      assert.strictEqual(config.jaegerPort, 9999);
    } finally {
      if (originalPort !== undefined) {
        process.env.JAEGER_PORT = originalPort;
      } else {
        delete process.env.JAEGER_PORT;
      }
    }
  });

  await t.test('initTracing defaults to localhost:6831', () => {
    const originalHost = process.env.JAEGER_HOST;
    const originalPort = process.env.JAEGER_PORT;
    try {
      delete process.env.JAEGER_HOST;
      delete process.env.JAEGER_PORT;
      const config = initTracing();
      assert.strictEqual(config.jaegerHost, 'localhost');
      assert.strictEqual(config.jaegerPort, 6831);
    } finally {
      if (originalHost !== undefined) {
        process.env.JAEGER_HOST = originalHost;
      }
      if (originalPort !== undefined) {
        process.env.JAEGER_PORT = originalPort;
      }
    }
  });
});
