import test from 'node:test';
import assert from 'node:assert/strict';
import { validationResult } from 'express-validator';
import { validateExerciseFields, validationErrorHandler } from '../sanitizer.mjs';

// Runs the real validateExerciseFields chain (the one actually wired into
// POST/PUT /exercises) against a mock req, the documented way to unit test
// express-validator chains without standing up a full Express app.
const runValidation = async (body) => {
  const req = { body };
  for (const validator of validateExerciseFields) {
    await validator.run(req);
  }
  return { req, result: validationResult(req) };
};

const mockRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

const validPayload = { name: 'Pushups', reps: 20, weight: 0, unit: 'lbs', date: '2026-08-12' };

test('validateExerciseFields', async (t) => {
  await t.test('accepts a valid payload', async () => {
    const { result } = await runValidation(validPayload);
    assert.equal(result.isEmpty(), true);
  });

  await t.test('trims the name but does not HTML-escape it', async () => {
    const { req, result } = await runValidation({
      ...validPayload,
      name: '  Bench & Press <3>  ',
    });
    assert.equal(result.isEmpty(), true);
    // Regression test: name used to come back HTML-entity-encoded
    // ("Bench &amp; Press &lt;3&gt;") and get persisted that way.
    assert.equal(req.body.name, 'Bench & Press <3>');
  });

  await t.test('rejects an empty name', async () => {
    const { result } = await runValidation({ ...validPayload, name: '' });
    assert.equal(result.isEmpty(), false);
  });

  await t.test('rejects a name over 255 characters', async () => {
    const { result } = await runValidation({ ...validPayload, name: 'a'.repeat(256) });
    assert.equal(result.isEmpty(), false);
  });

  await t.test('rejects non-positive reps', async () => {
    for (const reps of [0, -5]) {
      const { result } = await runValidation({ ...validPayload, reps });
      assert.equal(result.isEmpty(), false, `reps=${reps} should be rejected`);
    }
  });

  await t.test('rejects negative weight', async () => {
    const { result } = await runValidation({ ...validPayload, weight: -1 });
    assert.equal(result.isEmpty(), false);
  });

  await t.test('accepts zero weight', async () => {
    const { result } = await runValidation({ ...validPayload, weight: 0 });
    assert.equal(result.isEmpty(), true);
  });

  await t.test('rejects a unit outside kgs/lbs/miles', async () => {
    const { result } = await runValidation({ ...validPayload, unit: 'stone' });
    assert.equal(result.isEmpty(), false);
  });

  await t.test('accepts every valid unit', async () => {
    for (const unit of ['kgs', 'lbs', 'miles']) {
      const { result } = await runValidation({ ...validPayload, unit });
      assert.equal(result.isEmpty(), true, `unit=${unit} should be accepted`);
    }
  });

  await t.test('rejects a non-ISO8601 date', async () => {
    const { result } = await runValidation({ ...validPayload, date: 'not-a-date' });
    assert.equal(result.isEmpty(), false);
  });

  await t.test('reports every failing field at once', async () => {
    const { result } = await runValidation({
      name: '',
      reps: -1,
      weight: -1,
      unit: 'stone',
      date: 'nope',
    });
    const fields = result.array().map((err) => err.path);
    assert.deepEqual(new Set(fields), new Set(['name', 'reps', 'weight', 'unit', 'date']));
  });
});

test('validationErrorHandler', async (t) => {
  await t.test('calls next() and does not respond when validation passed', async () => {
    const { req } = await runValidation(validPayload);
    const res = mockRes();
    let nextCalled = false;

    validationErrorHandler(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, null);
  });

  await t.test('responds 400 with field-level details when validation failed', async () => {
    const { req } = await runValidation({ ...validPayload, name: '', reps: -1 });
    const res = mockRes();

    validationErrorHandler(req, res, () => {
      throw new Error('next should not be called');
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.Error, 'Validation failed');
    assert(Array.isArray(res.body.details));
    assert(res.body.details.some((d) => d.field === 'name'));
    assert(res.body.details.some((d) => d.field === 'reps'));
  });
});
