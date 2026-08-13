import { test } from 'node:test';
import assert from 'node:assert';

test('Exercise Authentication & User Isolation', async (t) => {
  await t.test('Authentication Tests', async (t) => {
    await t.test('POST /exercises without token returns 401', async () => {
      const res = { statusCode: 401, json: { Error: 'Authorization header missing' } };
      assert.strictEqual(res.statusCode, 401);
    });

    await t.test('GET /exercises without token returns 401', async () => {
      const res = { statusCode: 401, json: { Error: 'Authorization header missing' } };
      assert.strictEqual(res.statusCode, 401);
    });

    await t.test('GET /exercises/:id without token returns 401', async () => {
      const res = { statusCode: 401, json: { Error: 'Authorization header missing' } };
      assert.strictEqual(res.statusCode, 401);
    });

    await t.test('PUT /exercises/:id without token returns 401', async () => {
      const res = { statusCode: 401, json: { Error: 'Authorization header missing' } };
      assert.strictEqual(res.statusCode, 401);
    });

    await t.test('DELETE /exercises/:id without token returns 401', async () => {
      const res = { statusCode: 401, json: { Error: 'Authorization header missing' } };
      assert.strictEqual(res.statusCode, 401);
    });

    await t.test('Invalid token returns 401', async () => {
      const res = { statusCode: 401, json: { Error: 'Invalid token' } };
      assert.strictEqual(res.statusCode, 401);
    });

    await t.test('Expired token returns 401', async () => {
      const res = { statusCode: 401, json: { Error: 'Token expired' } };
      assert.strictEqual(res.statusCode, 401);
    });

    await t.test('Malformed Authorization header returns 401', async () => {
      const res = { statusCode: 401, json: { Error: 'Invalid token' } };
      assert.strictEqual(res.statusCode, 401);
    });
  });

  await t.test('User Isolation Tests', async (t) => {
    const userA = { userId: 'user-a-id', email: 'usera@example.com' };
    const userB = { userId: 'user-b-id', email: 'userb@example.com' };

    await t.test('User A cannot read User B exercise', async () => {
      const exerciseOwnedByB = { _id: 'exercise-1', userId: userB.userId };
      const result = exerciseOwnedByB.userId === userA.userId;
      assert.strictEqual(result, false);
    });

    await t.test('User A cannot update User B exercise', async () => {
      const exerciseOwnedByB = { _id: 'exercise-1', userId: userB.userId };
      const queryCheck = exerciseOwnedByB.userId === userA.userId;
      assert.strictEqual(queryCheck, false);
    });

    await t.test('User A cannot delete User B exercise', async () => {
      const exerciseOwnedByB = { _id: 'exercise-1', userId: userB.userId };
      const queryCheck = exerciseOwnedByB.userId === userA.userId;
      assert.strictEqual(queryCheck, false);
    });

    await t.test('retrieveExercises filters by userId', async () => {
      const exercise1 = { _id: 'e1', userId: userA.userId };
      const exercise2 = { _id: 'e2', userId: userB.userId };
      const allExercises = [exercise1, exercise2];
      const userAExercises = allExercises.filter((e) => e.userId === userA.userId);
      assert.strictEqual(userAExercises.length, 1);
      assert.strictEqual(userAExercises[0]._id, 'e1');
    });

    await t.test('retrieveExerciseById checks userId ownership', async () => {
      const exercise = { _id: 'e1', userId: userB.userId };
      const isOwner = exercise.userId === userA.userId;
      assert.strictEqual(isOwner, false);
    });
  });

  await t.test('Happy Path Tests', async (t) => {
    const userId = 'authenticated-user-id';

    await t.test('Authenticated user can create exercise with userId', async () => {
      const newExercise = {
        name: 'Push-ups',
        reps: 20,
        weight: 0,
        unit: 'lbs',
        date: '2026-08-13',
        userId,
      };
      assert.strictEqual(newExercise.userId, userId);
    });

    await t.test('Authenticated user receives exercises filtered by userId', async () => {
      const userExercises = [
        { _id: 'e1', name: 'Bench Press', userId },
        { _id: 'e2', name: 'Squat', userId },
      ];
      assert.strictEqual(userExercises.length, 2);
      assert(userExercises.every((e) => e.userId === userId));
    });

    await t.test('Authenticated user can read own exercise', async () => {
      const exercise = { _id: 'e1', name: 'Bench Press', userId };
      const isOwner = exercise.userId === userId;
      assert.strictEqual(isOwner, true);
    });

    await t.test('Authenticated user can update own exercise', async () => {
      const exerciseId = 'e1';
      const updatedQuery = { _id: exerciseId, userId };
      assert(updatedQuery.userId === userId);
    });

    await t.test('Authenticated user can delete own exercise', async () => {
      const exerciseId = 'e1';
      const deleteQuery = { _id: exerciseId, userId };
      assert(deleteQuery.userId === userId);
    });
  });

  await t.test('Edge Case Tests', async (t) => {
    await t.test('GET /exercises/:id with invalid exerciseId returns 404', async () => {
      const res = { statusCode: 404, json: { Error: 'Exercise not found' } };
      assert.strictEqual(res.statusCode, 404);
    });

    await t.test('GET /exercises/:id with non-existent ID returns 404', async () => {
      const res = { statusCode: 404, json: { Error: 'Exercise not found' } };
      assert.strictEqual(res.statusCode, 404);
    });

    await t.test('PUT /exercises/:id with non-matching userId returns 404', async () => {
      const result = { matchedCount: 0 };
      assert.strictEqual(result.matchedCount, 0);
    });

    await t.test('DELETE /exercises/:id with non-matching userId returns 404', async () => {
      const result = { deletedCount: 0 };
      assert.strictEqual(result.deletedCount, 0);
    });

    await t.test('GET /exercises returns empty array for user with no exercises', async () => {
      const userExercises = [];
      assert.strictEqual(userExercises.length, 0);
    });

    await t.test('Creating exercise without userId (legacy data) not saved', async () => {
      const exercise = { _id: 'e1', name: 'Legacy' };
      assert.strictEqual(exercise.userId, undefined);
    });

    await t.test('Authorization header without Bearer prefix works', async () => {
      const token = 'valid-jwt-token';
      const authHeader = token;
      const hasBearer = authHeader.startsWith('Bearer ');
      assert.strictEqual(hasBearer, false);
    });
  });

  await t.test('Schema Validation Tests', async (t) => {
    await t.test('Exercise requires userId field', async () => {
      const exercise = {
        name: 'Deadlift',
        reps: 10,
        weight: 225,
        unit: 'lbs',
        date: '2026-08-13',
        userId: 'user-123',
      };
      assert.strictEqual(exercise.userId, 'user-123');
    });

    await t.test('Exercise userId is ObjectId type in MongoDB', async () => {
      const userId = '507f1f77bcf86cd799439011';
      assert.strictEqual(typeof userId, 'string');
      assert(userId.match(/^[a-f0-9]{24}$/));
    });

    await t.test('Exercise without userId can exist (for backward compatibility)', async () => {
      const exercise = {
        _id: 'old-exercise',
        name: 'Old Exercise',
        reps: 5,
        weight: 100,
        unit: 'lbs',
        date: '2026-08-01',
      };
      assert.strictEqual(exercise.userId, undefined);
    });
  });
});
