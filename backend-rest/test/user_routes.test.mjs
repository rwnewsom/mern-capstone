import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../exercise_controller.mjs';
import User from '../user_model.mjs';
import { createFakeCollection } from './helpers/fakeCollection.mjs';
import { startTestServer, stopTestServer } from './helpers/testServer.mjs';
import { signToken } from './helpers/authToken.mjs';

// Real HTTP requests against the real /users/* routes (verifyToken,
// verifyAdmin, and the controller handlers), with only the Mongoose User
// model stubbed. See auth_exercise_integration.test.mjs for the same
// approach applied to /exercises.

let server;
let baseUrl;

before(async () => {
  ({ server, baseUrl } = await startTestServer(app));
});

after(async () => {
  await stopTestServer(server);
});

const adminId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const otherAdminId = 'cccccccccccccccccccccccc';
const userId = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const adminToken = signToken(adminId, 'admin');
const userToken = signToken(userId, 'user');

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token !== undefined ? { Authorization: `Bearer ${token}` } : {}),
});

const protectedRoutes = [
  { method: 'GET', path: '/users' },
  { method: 'GET', path: `/users/${userId}` },
  { method: 'PUT', path: `/users/${userId}/role`, body: { role: 'admin' } },
  { method: 'PUT', path: `/users/${userId}/status`, body: { isActive: false } },
  { method: 'DELETE', path: `/users/${userId}` },
];

test('User management routes: auth & admin gating', async (t) => {
  for (const route of protectedRoutes) {
    await t.test(`${route.method} ${route.path} without a token returns 401`, async () => {
      const res = await fetch(`${baseUrl}${route.path}`, {
        method: route.method,
        headers: authHeaders(),
        body: route.body ? JSON.stringify(route.body) : undefined,
      });
      assert.equal(res.status, 401);
    });

    await t.test(`${route.method} ${route.path} as a non-admin returns 403`, async () => {
      const res = await fetch(`${baseUrl}${route.path}`, {
        method: route.method,
        headers: authHeaders(userToken),
        body: route.body ? JSON.stringify(route.body) : undefined,
      });
      assert.equal(res.status, 403);
      assert.equal((await res.json()).Error, 'Admin access required');
    });
  }
});

test('GET /users', async (t) => {
  await t.test('returns all users (password excluded) for an admin', async (t) => {
    const fake = createFakeCollection([
      { _id: adminId, email: 'admin@example.com', role: 'admin' },
      { _id: userId, email: 'user@example.com', role: 'user' },
    ]);
    t.mock.method(User, 'find', (filter) => fake.find(filter));

    const res = await fetch(`${baseUrl}/users`, { headers: authHeaders(adminToken) });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.length, 2);
    assert(body.every((u) => !('password' in u)));
  });
});

test('GET /users/:id', async (t) => {
  await t.test('returns 404 for a non-existent user', async (t) => {
    const fake = createFakeCollection([]);
    t.mock.method(User, 'findById', (id) => fake.findById(id));

    const res = await fetch(`${baseUrl}/users/${userId}`, { headers: authHeaders(adminToken) });
    assert.equal(res.status, 404);
    assert.equal((await res.json()).Error, 'User not found');
  });

  await t.test('returns the user when found', async (t) => {
    const fake = createFakeCollection([{ _id: userId, email: 'user@example.com', role: 'user' }]);
    t.mock.method(User, 'findById', (id) => fake.findById(id));

    const res = await fetch(`${baseUrl}/users/${userId}`, { headers: authHeaders(adminToken) });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).email, 'user@example.com');
  });
});

test('PUT /users/:id/role', async (t) => {
  await t.test('rejects a role outside user/admin', async () => {
    const res = await fetch(`${baseUrl}/users/${userId}/role`, {
      method: 'PUT',
      headers: authHeaders(adminToken),
      body: JSON.stringify({ role: 'moderator' }),
    });
    assert.equal(res.status, 400);
  });

  await t.test('an admin cannot change their own role', async () => {
    const res = await fetch(`${baseUrl}/users/${adminId}/role`, {
      method: 'PUT',
      headers: authHeaders(adminToken),
      body: JSON.stringify({ role: 'user' }),
    });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).Error, 'Cannot change your own role');
  });

  await t.test('promotes another user to admin', async (t) => {
    const fake = createFakeCollection([{ _id: userId, email: 'user@example.com', role: 'user' }]);
    t.mock.method(User, 'findByIdAndUpdate', (id, updates) => fake.findByIdAndUpdate(id, updates));

    const res = await fetch(`${baseUrl}/users/${userId}/role`, {
      method: 'PUT',
      headers: authHeaders(adminToken),
      body: JSON.stringify({ role: 'admin' }),
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.role, 'admin');
  });

  await t.test('returns 404 for a non-existent user', async (t) => {
    const fake = createFakeCollection([]);
    t.mock.method(User, 'findByIdAndUpdate', (id, updates) => fake.findByIdAndUpdate(id, updates));

    const res = await fetch(`${baseUrl}/users/${otherAdminId}/role`, {
      method: 'PUT',
      headers: authHeaders(adminToken),
      body: JSON.stringify({ role: 'admin' }),
    });
    assert.equal(res.status, 404);
  });
});

test('PUT /users/:id/status', async (t) => {
  await t.test('rejects a non-boolean isActive', async () => {
    const res = await fetch(`${baseUrl}/users/${userId}/status`, {
      method: 'PUT',
      headers: authHeaders(adminToken),
      body: JSON.stringify({ isActive: 'yes' }),
    });
    assert.equal(res.status, 400);
  });

  await t.test('an admin cannot deactivate their own account', async () => {
    const res = await fetch(`${baseUrl}/users/${adminId}/status`, {
      method: 'PUT',
      headers: authHeaders(adminToken),
      body: JSON.stringify({ isActive: false }),
    });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).Error, 'Cannot change your own status');
  });

  await t.test('deactivates another user', async (t) => {
    const fake = createFakeCollection([
      { _id: userId, email: 'user@example.com', role: 'user', isActive: true },
    ]);
    t.mock.method(User, 'findByIdAndUpdate', (id, updates) => fake.findByIdAndUpdate(id, updates));

    const res = await fetch(`${baseUrl}/users/${userId}/status`, {
      method: 'PUT',
      headers: authHeaders(adminToken),
      body: JSON.stringify({ isActive: false }),
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.isActive, false);
  });
});

test('DELETE /users/:id', async (t) => {
  await t.test('an admin cannot delete their own account', async () => {
    const res = await fetch(`${baseUrl}/users/${adminId}`, {
      method: 'DELETE',
      headers: authHeaders(adminToken),
    });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).Error, 'Cannot delete your own account');
  });

  await t.test('returns 404 for a non-existent user', async (t) => {
    const fake = createFakeCollection([]);
    t.mock.method(User, 'findByIdAndDelete', (id) => fake.findByIdAndDelete(id));

    const res = await fetch(`${baseUrl}/users/${otherAdminId}`, {
      method: 'DELETE',
      headers: authHeaders(adminToken),
    });
    assert.equal(res.status, 404);
  });

  await t.test('deletes another user and returns 204', async (t) => {
    const fake = createFakeCollection([{ _id: userId, email: 'user@example.com', role: 'user' }]);
    t.mock.method(User, 'findByIdAndDelete', (id) => fake.findByIdAndDelete(id));

    const res = await fetch(`${baseUrl}/users/${userId}`, {
      method: 'DELETE',
      headers: authHeaders(adminToken),
    });
    assert.equal(res.status, 204);
    assert.equal(fake.docs.length, 0);
  });
});
