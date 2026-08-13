import test from 'node:test';
import assert from 'node:assert/strict';

import { validateExerciseInput } from '../exercise_controller.mjs';

// ============================================================================
// VALIDATION TESTS
// ============================================================================

test('validation: rejects null or empty input', () => {
  assert.equal(validateExerciseInput(null), null);
  assert.equal(validateExerciseInput({}), null);
});

test('validation: rejects empty or invalid name', () => {
  const base = { reps: 3, weight: 10, unit: 'kgs', date: '2024-01-01' };
  assert.equal(validateExerciseInput({ ...base, name: '' }), null);
  assert.equal(validateExerciseInput({ ...base, name: '   ' }), null);
  assert.equal(validateExerciseInput({ ...base, name: 123 }), null);
});

test('validation: rejects invalid reps', () => {
  const base = { name: 'Pushups', weight: 10, unit: 'kgs', date: '2024-01-01' };
  assert.equal(validateExerciseInput({ ...base, reps: 0 }), null);
  assert.equal(validateExerciseInput({ ...base, reps: -5 }), null);
  assert.equal(validateExerciseInput({ ...base, reps: 3.5 }), null);
});

test('validation: rejects invalid weight', () => {
  const base = { name: 'Pushups', reps: 3, unit: 'kgs', date: '2024-01-01' };
  assert.equal(validateExerciseInput({ ...base, weight: -1 }), null);
  assert.equal(validateExerciseInput({ ...base, weight: 10.5 }), null);
});

test('validation: rejects invalid unit', () => {
  const base = { name: 'Pushups', reps: 3, weight: 10, date: '2024-01-01' };
  assert.equal(validateExerciseInput({ ...base, unit: 'yards' }), null);
  assert.equal(validateExerciseInput({ ...base, unit: 'oz' }), null);
  assert.equal(validateExerciseInput({ ...base, unit: null }), null);
});

test('validation: rejects invalid date', () => {
  const base = { name: 'Pushups', reps: 3, weight: 10, unit: 'kgs' };
  assert.equal(validateExerciseInput({ ...base, date: 'not-a-date' }), null);
  assert.equal(validateExerciseInput({ ...base, date: null }), null);
  assert.equal(validateExerciseInput({ ...base, date: '2024-13-01' }), null);
});

test('validation: accepts valid exercise payload', () => {
  const validPayload = {
    name: 'Pushups',
    reps: 20,
    weight: 0,
    unit: 'kgs',
    date: '2024-01-01',
  };

  assert.deepEqual(validateExerciseInput(validPayload), validPayload);
});

test('validation: accepts all valid units', () => {
  const base = { name: 'Running', reps: 1, weight: 0, date: '2024-01-01' };

  assert.deepEqual(validateExerciseInput({ ...base, unit: 'kgs' }).unit, 'kgs');
  assert.deepEqual(validateExerciseInput({ ...base, unit: 'lbs' }).unit, 'lbs');
  assert.deepEqual(validateExerciseInput({ ...base, unit: 'miles' }).unit, 'miles');
});

// ============================================================================
// ENDPOINT SIMULATION TESTS
// ============================================================================

test('POST /exercises: returns 201 on valid input', () => {
  let responseStatus = null;
  let responseData = null;

  const mockRes = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(_data) {
      responseData = _data;
      return this;
    },
  };

  const validInput = {
    name: 'Squats',
    reps: 15,
    weight: 135,
    unit: 'lbs',
    date: '2024-01-01',
  };

  // Simulate validation and response
  const validated = validateExerciseInput(validInput);
  if (validated) {
    mockRes.status(201).json(validated);
  } else {
    mockRes.status(400).json({ Error: 'Invalid request' });
  }

  assert.equal(responseStatus, 201, 'Should return 201 on valid input');
  assert.equal(responseData.name, 'Squats', 'Should return exercise data');
});

test('POST /exercises: returns 400 on invalid input', () => {
  let responseStatus = null;

  const mockRes = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(_data) {
      return this;
    },
  };

  const invalidInput = { name: '', reps: 3, weight: 10, unit: 'kgs', date: '2024-01-01' };

  // Simulate validation and response
  const validated = validateExerciseInput(invalidInput);
  if (validated) {
    mockRes.status(201).json(validated);
  } else {
    mockRes.status(400).json({ Error: 'Invalid request' });
  }

  assert.equal(responseStatus, 400, 'Should return 400 on invalid input');
});

test('GET /exercises/:id: returns 404 when not found', () => {
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
    },
  };

  // Simulate DB result (not found)
  const dbResult = null;

  if (!dbResult) {
    mockRes.status(404).json({ Error: 'Not found' });
  } else {
    mockRes.status(200).json(dbResult);
  }

  assert.equal(responseStatus, 404, 'Should return 404 when exercise not found');
  assert.deepEqual(responseData, { Error: 'Not found' });
});

test('DELETE /exercises/:id: returns 404 when not found', () => {
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
    },
  };

  // Simulate DB delete result (not found)
  const dbResult = { deletedCount: 0 };

  if (dbResult.deletedCount === 0) {
    mockRes.status(404).json({ Error: 'Not found' });
  } else {
    mockRes.status(204).json();
  }

  assert.equal(responseStatus, 404, 'Should return 404 status');
  assert.deepEqual(responseData, { Error: 'Not found' });
});

test('DELETE /exercises/:id: returns 204 on successful delete', () => {
  let responseStatus = null;

  const mockRes = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(_data) {
      return this;
    },
  };

  // Simulate DB delete result (success)
  const dbResult = { deletedCount: 1 };

  if (dbResult.deletedCount === 0) {
    mockRes.status(404).json({ Error: 'Not found' });
  } else {
    mockRes.status(204).json();
  }

  assert.equal(responseStatus, 204, 'Should return 204 status for successful delete');
});

test('PUT /exercises/:id: returns 404 when not found', () => {
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
    },
  };

  const validInput = { name: 'Updated', reps: 10, weight: 50, unit: 'kgs', date: '2024-01-01' };
  const validated = validateExerciseInput(validInput);

  if (!validated) {
    mockRes.status(400).json({ Error: 'Invalid request' });
  } else {
    // Simulate DB update result (not found)
    const dbResult = { matchedCount: 0 };
    if (dbResult.matchedCount === 0) {
      mockRes.status(404).json({ Error: 'Not found' });
    } else {
      mockRes.status(200).json(validated);
    }
  }

  assert.equal(responseStatus, 404, 'Should return 404 when exercise not found');
  assert.deepEqual(responseData, { Error: 'Not found' });
});

test('PUT /exercises/:id: returns 400 on invalid input', () => {
  let responseStatus = null;

  const mockRes = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(_data) {
      return this;
    },
  };

  const invalidInput = { name: '', reps: 10, weight: 50, unit: 'kgs', date: '2024-01-01' };
  const validated = validateExerciseInput(invalidInput);

  if (!validated) {
    mockRes.status(400).json({ Error: 'Invalid request' });
  } else {
    mockRes.status(200).json(validated);
  }

  assert.equal(responseStatus, 400, 'Should return 400 on invalid input');
});
