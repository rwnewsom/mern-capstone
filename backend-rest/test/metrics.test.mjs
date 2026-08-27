import test from 'node:test';
import assert from 'node:assert';
import { recordRequest, getMetrics, resetMetrics } from '../metrics.mjs';

test('Metrics Module', async (t) => {
  await t.test('recordRequest is a function', () => {
    assert.strictEqual(typeof recordRequest, 'function');
  });

  await t.test('recordRequest accepts method, path, statusCode, responseTime', () => {
    resetMetrics();
    recordRequest('GET', '/api/test', 200, 50);
    const metrics = getMetrics();
    assert.strictEqual(metrics.requests.total, 1);
  });

  await t.test('recordRequest increments total requests', () => {
    resetMetrics();
    recordRequest('GET', '/api/test', 200, 50);
    recordRequest('POST', '/api/test', 201, 75);
    const metrics = getMetrics();
    assert.strictEqual(metrics.requests.total, 2);
  });

  await t.test('recordRequest tracks status codes', () => {
    resetMetrics();
    recordRequest('GET', '/api/test', 200, 50);
    recordRequest('GET', '/api/test', 400, 30);
    const metrics = getMetrics();
    assert.strictEqual(metrics.requests.byStatus[200], 1);
    assert.strictEqual(metrics.requests.byStatus[400], 1);
  });

  await t.test('recordRequest tracks by method', () => {
    resetMetrics();
    recordRequest('GET', '/api/test', 200, 50);
    recordRequest('POST', '/api/test', 201, 75);
    const metrics = getMetrics();
    assert.strictEqual(metrics.requests.byMethod.GET, 1);
    assert.strictEqual(metrics.requests.byMethod.POST, 1);
  });

  await t.test('recordRequest tracks by path', () => {
    resetMetrics();
    recordRequest('GET', '/api/test', 200, 50);
    recordRequest('GET', '/api/other', 200, 75);
    const metrics = getMetrics();
    assert.strictEqual(metrics.requests.byPath['/api/test'], 1);
    assert.strictEqual(metrics.requests.byPath['/api/other'], 1);
  });

  await t.test('recordRequest tracks 4xx errors', () => {
    resetMetrics();
    recordRequest('GET', '/api/test', 404, 50);
    recordRequest('GET', '/api/test', 400, 50);
    const metrics = getMetrics();
    assert.strictEqual(metrics.errors.total, 2);
    assert.strictEqual(metrics.errors.by4xx, 2);
  });

  await t.test('recordRequest tracks 5xx errors', () => {
    resetMetrics();
    recordRequest('GET', '/api/test', 500, 50);
    recordRequest('GET', '/api/test', 503, 50);
    const metrics = getMetrics();
    assert.strictEqual(metrics.errors.total, 2);
    assert.strictEqual(metrics.errors.by5xx, 2);
  });

  await t.test('getMetrics returns complete metrics object', () => {
    resetMetrics();
    recordRequest('GET', '/api/test', 200, 100);
    recordRequest('GET', '/api/test', 200, 200);
    const metrics = getMetrics();
    assert(metrics.uptime >= 0);
    assert.strictEqual(metrics.requests.total, 2);
    assert.strictEqual(metrics.responseTimes.count, 2);
    assert.strictEqual(metrics.responseTimes.average, 150);
  });

  await t.test('getMetrics calculates min and max response times', () => {
    resetMetrics();
    recordRequest('GET', '/api/test', 200, 50);
    recordRequest('GET', '/api/test', 200, 150);
    recordRequest('GET', '/api/test', 200, 100);
    const metrics = getMetrics();
    assert.strictEqual(metrics.responseTimes.min, 50);
    assert.strictEqual(metrics.responseTimes.max, 150);
  });

  await t.test('resetMetrics clears all metrics', () => {
    recordRequest('GET', '/api/test', 200, 50);
    resetMetrics();
    const metrics = getMetrics();
    assert.strictEqual(metrics.requests.total, 0);
    assert.strictEqual(metrics.errors.total, 0);
    assert.strictEqual(metrics.responseTimes.count, 0);
  });
});
