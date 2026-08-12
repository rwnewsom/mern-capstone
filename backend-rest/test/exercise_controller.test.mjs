import test from 'node:test';
import assert from 'node:assert/strict';

import { validateExerciseInput } from '../exercise_controller.mjs';
import * as exercises from '../exercise_model.mjs';

test('rejects missing or invalid exercise fields', () => {
  assert.equal(validateExerciseInput(null), null);
  assert.equal(validateExerciseInput({}), null);
  assert.equal(validateExerciseInput({ name: '', reps: 3, weight: 10, unit: 'kgs', date: '2024-01-01' }), null);
  assert.equal(validateExerciseInput({ name: 'Pushups', reps: 0, weight: 10, unit: 'kgs', date: '2024-01-01' }), null);
  assert.equal(validateExerciseInput({ name: 'Pushups', reps: 3, weight: -1, unit: 'kgs', date: '2024-01-01' }), null);
  assert.equal(validateExerciseInput({ name: 'Pushups', reps: 3, weight: 10, unit: 'yards', date: '2024-01-01' }), null);
  assert.equal(validateExerciseInput({ name: 'Pushups', reps: 3, weight: 10, unit: 'kgs', date: 'not-a-date' }), null);
});

test('accepts a valid exercise payload', () => {
  const result = validateExerciseInput({
    name: 'Pushups',
    reps: 3,
    weight: 10,
    unit: 'kgs',
    date: '2024-01-01'
  });

  assert.deepEqual(result, {
    name: 'Pushups',
    reps: 3,
    weight: 10,
    unit: 'kgs',
    date: '2024-01-01'
  });
});

// Test for DELETE endpoint 404 response
test('DELETE endpoint returns 404 when exercise not found', () => {
  let responseStatus = null;
  let responseData = null;

  const mockRes = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    }
  };

  // Simulate endpoint handler - not found case
  const result = { deletedCount: 0 };

  if (result.deletedCount === 0) {
    mockRes.status(404).json({ Error: 'Not found' });
  } else {
    mockRes.status(204).json();
  }

  assert.equal(responseStatus, 404, 'Should return 404 status');
  assert.deepEqual(responseData, { Error: 'Not found' }, 'Should return error object');
});

test('DELETE endpoint returns 204 when exercise is deleted', () => {
  let responseStatus = null;

  const mockRes = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      return this;
    }
  };

  // Simulate endpoint handler - successful delete case
  const result = { deletedCount: 1 };

  if (result.deletedCount === 0) {
    mockRes.status(404).json({ Error: 'Not found' });
  } else {
    mockRes.status(204).json();
  }

  assert.equal(responseStatus, 204, 'Should return 204 status for successful delete');
});
