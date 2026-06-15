import test from 'node:test';
import assert from 'node:assert/strict';

import { validateExerciseInput } from '../exercise_controller.mjs';

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
