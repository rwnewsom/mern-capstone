import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../exercise_controller.mjs';
import { Exercise } from '../exercise_model.mjs';
import { createFakeCollection } from './helpers/fakeCollection.mjs';
import { startTestServer, stopTestServer } from './helpers/testServer.mjs';
import { signToken } from './helpers/authToken.mjs';

// Real HTTP requests against the real Express app + real middleware chain
// (verifyToken, exerciseLimiter, validateExerciseFields, the route handlers).
// Only the Mongoose layer (Exercise.find/findOne/etc.) is stubbed, via a
// small in-memory fake collection that honors the same equality filters
// (e.g. `{ _id, userId }`) the app actually issues — so the ownership
// filtering and status-code logic under test is the app's real code, not a
// hand-rolled restatement of what it's supposed to do.

let server;
let baseUrl;

before(async () => {
  ({ server, baseUrl } = await startTestServer(app));
});

after(async () => {
  await stopTestServer(server);
});

// Valid-looking ObjectId hex strings: exercise.userId is a real
// mongoose.Schema.Types.ObjectId, and a non-hex string like 'user-a-id'
// silently fails Mongoose's cast during `new Exercise({ userId, ... })`
// construction (the field ends up undefined rather than throwing).
const userA = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const userB = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const tokenA = signToken(userA);
const tokenB = signToken(userB);

const jsonHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token !== undefined ? { Authorization: `Bearer ${token}` } : {}),
});

const validBody = {
  name: 'Pushups',
  reps: 20,
  weight: 0,
  unit: 'lbs',
  date: '2026-08-12',
};

test('Exercise Authentication & User Isolation', async (t) => {
  await t.test('Authentication Tests', async (t) => {
    await t.test('POST /exercises without token returns 401', async () => {
      const res = await fetch(`${baseUrl}/exercises`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(validBody),
      });
      assert.equal(res.status, 401);
      assert.equal((await res.json()).Error, 'Authorization header missing');
    });

    await t.test('GET /exercises without token returns 401', async () => {
      const res = await fetch(`${baseUrl}/exercises`);
      assert.equal(res.status, 401);
    });

    await t.test('GET /exercises/:id without token returns 401', async () => {
      const res = await fetch(`${baseUrl}/exercises/anything`);
      assert.equal(res.status, 401);
    });

    await t.test('PUT /exercises/:id without token returns 401', async () => {
      const res = await fetch(`${baseUrl}/exercises/anything`, {
        method: 'PUT',
        headers: jsonHeaders(),
        body: JSON.stringify(validBody),
      });
      assert.equal(res.status, 401);
    });

    await t.test('DELETE /exercises/:id without token returns 401', async () => {
      const res = await fetch(`${baseUrl}/exercises/anything`, { method: 'DELETE' });
      assert.equal(res.status, 401);
    });

    await t.test('Invalid token returns 401', async () => {
      const res = await fetch(`${baseUrl}/exercises`, {
        headers: jsonHeaders('not-a-real-token'),
      });
      assert.equal(res.status, 401);
      assert.equal((await res.json()).Error, 'Invalid token');
    });

    await t.test('Expired token returns 401', async () => {
      const expired = signToken(userA, 'user', { expiresIn: '-10s' });
      const res = await fetch(`${baseUrl}/exercises`, { headers: jsonHeaders(expired) });
      assert.equal(res.status, 401);
      assert.equal((await res.json()).Error, 'Token expired');
    });

    await t.test('Authorization header without Bearer prefix still works', async (t) => {
      const fake = createFakeCollection([]);
      t.mock.method(Exercise, 'find', (filter) => fake.find(filter));

      const res = await fetch(`${baseUrl}/exercises`, {
        headers: { Authorization: tokenA }, // no "Bearer " prefix
      });
      assert.equal(res.status, 200);
    });
  });

  await t.test('User Isolation Tests', async (t) => {
    const exerciseOwnedByB = {
      _id: 'exercise-1',
      name: 'Deadlift',
      reps: 5,
      weight: 225,
      unit: 'lbs',
      date: new Date('2026-08-01'),
      userId: userB,
    };

    await t.test('User A cannot read User B exercise', async (t) => {
      const fake = createFakeCollection([exerciseOwnedByB]);
      t.mock.method(Exercise, 'findOne', (filter) => fake.findOne(filter));

      const res = await fetch(`${baseUrl}/exercises/exercise-1`, { headers: jsonHeaders(tokenA) });
      assert.equal(res.status, 404);
    });

    await t.test('User A cannot update User B exercise', async (t) => {
      const fake = createFakeCollection([exerciseOwnedByB]);
      t.mock.method(Exercise, 'updateOne', (filter, updates) => fake.updateOne(filter, updates));

      const res = await fetch(`${baseUrl}/exercises/exercise-1`, {
        method: 'PUT',
        headers: jsonHeaders(tokenA),
        body: JSON.stringify(validBody),
      });
      assert.equal(res.status, 404);
    });

    await t.test('User A cannot delete User B exercise', async (t) => {
      const fake = createFakeCollection([exerciseOwnedByB]);
      t.mock.method(Exercise, 'deleteOne', (filter) => fake.deleteOne(filter));

      const res = await fetch(`${baseUrl}/exercises/exercise-1`, {
        method: 'DELETE',
        headers: jsonHeaders(tokenA),
      });
      assert.equal(res.status, 404);
    });

    await t.test('retrieveExercises filters by userId', async (t) => {
      const fake = createFakeCollection([
        { ...exerciseOwnedByB, _id: 'e-b', userId: userB },
        { ...exerciseOwnedByB, _id: 'e-a', userId: userA },
      ]);
      t.mock.method(Exercise, 'find', (filter) => fake.find(filter));

      const res = await fetch(`${baseUrl}/exercises`, { headers: jsonHeaders(tokenA) });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.length, 1);
      assert.equal(body[0]._id, 'e-a');
    });

    await t.test('User B can read their own exercise', async (t) => {
      const fake = createFakeCollection([exerciseOwnedByB]);
      t.mock.method(Exercise, 'findOne', (filter) => fake.findOne(filter));

      const res = await fetch(`${baseUrl}/exercises/exercise-1`, { headers: jsonHeaders(tokenB) });
      assert.equal(res.status, 200);
      assert.equal((await res.json()).name, 'Deadlift');
    });
  });

  await t.test('Happy Path Tests', async (t) => {
    await t.test(
      'Authenticated user can create an exercise, tagged with their userId',
      async (t) => {
        const fake = createFakeCollection([]);
        t.mock.method(Exercise.prototype, 'save', function save() {
          this._id = 'new-exercise-id';
          fake.push(this);
          return Promise.resolve(this);
        });

        const res = await fetch(`${baseUrl}/exercises`, {
          method: 'POST',
          headers: jsonHeaders(tokenA),
          body: JSON.stringify(validBody),
        });
        const body = await res.json();
        assert.equal(res.status, 201);
        assert.equal(body.name, 'Pushups');
        assert.equal(String(body.userId), userA);
      }
    );

    await t.test('Authenticated user can update their own exercise', async (t) => {
      const doc = {
        _id: 'exercise-2',
        ...validBody,
        date: new Date(validBody.date),
        userId: userA,
      };
      const fake = createFakeCollection([doc]);
      t.mock.method(Exercise, 'updateOne', (filter, updates) => fake.updateOne(filter, updates));
      t.mock.method(Exercise, 'findOne', (filter) => fake.findOne(filter));

      const res = await fetch(`${baseUrl}/exercises/exercise-2`, {
        method: 'PUT',
        headers: jsonHeaders(tokenA),
        body: JSON.stringify({ ...validBody, name: 'Updated Pushups' }),
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.name, 'Updated Pushups');
    });

    await t.test('Authenticated user can delete their own exercise', async (t) => {
      const doc = {
        _id: 'exercise-3',
        ...validBody,
        date: new Date(validBody.date),
        userId: userA,
      };
      const fake = createFakeCollection([doc]);
      t.mock.method(Exercise, 'deleteOne', (filter) => fake.deleteOne(filter));

      const res = await fetch(`${baseUrl}/exercises/exercise-3`, {
        method: 'DELETE',
        headers: jsonHeaders(tokenA),
      });
      assert.equal(res.status, 204);
    });
  });

  await t.test('Edge Case Tests', async (t) => {
    await t.test('GET /exercises/:id with non-existent id returns 404', async (t) => {
      const fake = createFakeCollection([]);
      t.mock.method(Exercise, 'findOne', (filter) => fake.findOne(filter));

      const res = await fetch(`${baseUrl}/exercises/does-not-exist`, {
        headers: jsonHeaders(tokenA),
      });
      assert.equal(res.status, 404);
      assert.equal((await res.json()).Error, 'Not found');
    });

    await t.test('PUT /exercises/:id with non-existent id returns 404', async (t) => {
      const fake = createFakeCollection([]);
      t.mock.method(Exercise, 'updateOne', (filter, updates) => fake.updateOne(filter, updates));

      const res = await fetch(`${baseUrl}/exercises/does-not-exist`, {
        method: 'PUT',
        headers: jsonHeaders(tokenA),
        body: JSON.stringify(validBody),
      });
      assert.equal(res.status, 404);
    });

    await t.test('DELETE /exercises/:id with non-existent id returns 404', async (t) => {
      const fake = createFakeCollection([]);
      t.mock.method(Exercise, 'deleteOne', (filter) => fake.deleteOne(filter));

      const res = await fetch(`${baseUrl}/exercises/does-not-exist`, {
        method: 'DELETE',
        headers: jsonHeaders(tokenA),
      });
      assert.equal(res.status, 404);
    });

    await t.test('GET /exercises returns an empty array for a user with none', async (t) => {
      const fake = createFakeCollection([]);
      t.mock.method(Exercise, 'find', (filter) => fake.find(filter));

      const res = await fetch(`${baseUrl}/exercises`, { headers: jsonHeaders(tokenA) });
      assert.deepEqual(await res.json(), []);
    });
  });

  await t.test('Validation Tests', async (t) => {
    await t.test(
      'POST /exercises with an invalid body returns 400 with field details',
      async () => {
        const res = await fetch(`${baseUrl}/exercises`, {
          method: 'POST',
          headers: jsonHeaders(tokenA),
          body: JSON.stringify({ ...validBody, name: '', reps: -1 }),
        });
        const body = await res.json();
        assert.equal(res.status, 400);
        assert.equal(body.Error, 'Validation failed');
        assert(body.details.some((d) => d.field === 'name'));
        assert(body.details.some((d) => d.field === 'reps'));
      }
    );
  });
});
