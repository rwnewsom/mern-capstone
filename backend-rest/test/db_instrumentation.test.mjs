import test from 'node:test';
import assert from 'node:assert';
import { initDbTracer, traceDbOperation } from '../db_instrumentation.mjs';

test('Database Instrumentation Module', async (t) => {
  await t.test('initDbTracer is a function', () => {
    assert.strictEqual(typeof initDbTracer, 'function');
  });

  await t.test('traceDbOperation is a function', () => {
    assert.strictEqual(typeof traceDbOperation, 'function');
  });

  await t.test('traceDbOperation executes async function without tracer', async () => {
    initDbTracer(null);
    let executed = false;
    const result = await traceDbOperation('test', 'test_collection', 'insert', async () => {
      executed = true;
      return 'result';
    });
    assert(executed);
    assert.strictEqual(result, 'result');
  });

  await t.test('traceDbOperation handles errors without tracer', async () => {
    initDbTracer(null);
    try {
      await traceDbOperation('test', 'test_collection', 'insert', async () => {
        throw new Error('Test error');
      });
      assert.fail('Should have thrown error');
    } catch (err) {
      assert.strictEqual(err.message, 'Test error');
    }
  });

  await t.test('traceDbOperation handles mock tracer', async () => {
    const mockTracer = {
      startSpan: () => ({
        setAttributes: () => {},
        recordException: () => {},
        end: () => {},
      }),
    };
    initDbTracer(mockTracer);

    let executed = false;
    const result = await traceDbOperation('test', 'test_collection', 'insert', async () => {
      executed = true;
      return 'result';
    });

    assert(executed);
    assert.strictEqual(result, 'result');
  });

  await t.test('traceDbOperation sets correct span attributes', async () => {
    const attributes = {};
    const mockTracer = {
      startSpan: (_name) => ({
        setAttributes: (attrs) => {
          Object.assign(attributes, attrs);
        },
        recordException: () => {},
        end: () => {},
      }),
    };
    initDbTracer(mockTracer);

    await traceDbOperation('findOne', 'users', 'query', async () => {
      return { id: 1 };
    });

    assert.strictEqual(attributes['db.system'], 'mongodb');
    assert.strictEqual(attributes['db.operation'], 'findOne');
    assert.strictEqual(attributes['db.collection'], 'users');
    assert.strictEqual(attributes['db.mongodb.command'], 'query');
    assert(attributes['db.response_time_ms'] >= 0);
  });

  await t.test('traceDbOperation records exceptions with tracer', async () => {
    let recordedError = null;
    const mockTracer = {
      startSpan: () => ({
        setAttributes: () => {},
        recordException: (err) => {
          recordedError = err;
        },
        end: () => {},
      }),
    };
    initDbTracer(mockTracer);

    const testError = new Error('Database error');
    try {
      await traceDbOperation('insert', 'logs', 'insert', async () => {
        throw testError;
      });
    } catch (err) {
      assert.strictEqual(err, testError);
    }

    assert.strictEqual(recordedError, testError);
  });
});
