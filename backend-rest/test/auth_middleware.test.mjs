import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { verifyToken, verifyAdmin } from '../auth_middleware.mjs';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// ============================================================================
// VERIFY TOKEN TESTS
// ============================================================================

test('verifyToken: is a function', () => {
  assert(typeof verifyToken === 'function', 'verifyToken should be a function');
});

test('verifyToken: accepts req, res, next parameters', () => {
  const req = { headers: {} };
  const res = {
    status(code) {
      assert.equal(code, 401);
      return this;
    },
    json() {
      return this;
    },
  };
  const next = () => {};

  assert.doesNotThrow(() => {
    verifyToken(req, res, next);
  }, 'verifyToken should not throw');
});

test('verifyToken: rejects request without authorization header', () => {
  const req = { headers: {} };
  const res = {
    status(code) {
      assert.equal(code, 401, 'should return 401');
      return this;
    },
    json(data) {
      assert.equal(data.Error, 'Authorization header missing');
    },
  };

  const next = () => {
    throw new Error('next should not be called');
  };

  verifyToken(req, res, next);
});

test('verifyToken: rejects invalid token', () => {
  const req = {
    headers: {
      authorization: 'Bearer invalid-token',
    },
  };

  const res = {
    status(code) {
      assert.equal(code, 401, 'should return 401');
      return this;
    },
    json(data) {
      assert.equal(data.Error, 'Invalid token');
    },
  };

  const next = () => {
    throw new Error('next should not be called');
  };

  verifyToken(req, res, next);
});

test('verifyToken: rejects token signed with wrong secret', () => {
  const token = jwt.sign({ userId: '123', role: 'user' }, 'wrong-secret');
  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };

  const res = {
    status(code) {
      assert.equal(code, 401, 'should return 401');
      return this;
    },
    json(data) {
      assert.equal(data.Error, 'Invalid token');
    },
  };

  const next = () => {
    throw new Error('next should not be called');
  };

  verifyToken(req, res, next);
});

// ============================================================================
// VERIFY ADMIN TESTS
// ============================================================================

test('verifyAdmin: allows access for admin role', () => {
  const req = { userRole: 'admin' };
  const res = {
    status: () => {
      throw new Error('Should not call status for admin');
    },
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  verifyAdmin(req, res, next);
  assert.equal(nextCalled, true, 'next should be called for admin');
});

test('verifyAdmin: denies access for user role', () => {
  const req = { userRole: 'user' };
  const res = {
    status(code) {
      assert.equal(code, 403, 'should return 403');
      return this;
    },
    json(data) {
      assert.equal(data.Error, 'Admin access required');
    },
  };

  const next = () => {
    throw new Error('next should not be called');
  };

  verifyAdmin(req, res, next);
});

test('verifyAdmin: denies access when role is missing', () => {
  const req = { userRole: undefined };
  const res = {
    status(code) {
      assert.equal(code, 403, 'should return 403');
      return this;
    },
    json(data) {
      assert.equal(data.Error, 'Admin access required');
    },
  };

  const next = () => {
    throw new Error('next should not be called');
  };

  verifyAdmin(req, res, next);
});
