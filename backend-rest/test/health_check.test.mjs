import test from 'node:test';
import assert from 'node:assert';
import { checkDatabase, getFullHealth } from '../health_check.mjs';

test('Health Check Module', async (t) => {
  await t.test('checkDatabase is a function', () => {
    assert.strictEqual(typeof checkDatabase, 'function');
  });

  await t.test('checkDatabase returns object with status and message', async () => {
    const result = await checkDatabase();
    assert.strictEqual(typeof result, 'object');
    assert(result.status);
    assert(result.message);
  });

  await t.test('getFullHealth is a function', () => {
    assert.strictEqual(typeof getFullHealth, 'function');
  });

  await t.test('getFullHealth returns complete health object', async () => {
    const health = await getFullHealth();
    assert.strictEqual(typeof health, 'object');
    assert(health.status);
    assert(health.timestamp);
    assert(health.checks);
    assert(typeof health.responseTime, 'number');
  });

  await t.test('getFullHealth includes database check', async () => {
    const health = await getFullHealth();
    assert(health.checks.database);
    assert(health.checks.database.status);
    assert(health.checks.database.message);
  });

  await t.test('getFullHealth status is healthy or degraded', async () => {
    const health = await getFullHealth();
    assert(['healthy', 'degraded'].includes(health.status));
  });
});
