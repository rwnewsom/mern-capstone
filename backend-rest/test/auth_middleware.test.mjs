import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { verifyToken, verifyAdmin } from '../auth_middleware.mjs';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// ============================================================================
// VERIFY TOKEN TESTS
// ============================================================================

test('verifyToken: extracts userId and role from valid token', () => {
  const token = jwt.sign({ userId: '123', role: 'user' }, JWT_SECRET);
  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };

  const res = {
    status: () => {
      throw new Error('Should not call status on valid token');
    },
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  verifyToken(req, res, next);

  assert.equal(req.userId, '123', 'userId should be set from token');
  assert.equal(req.userRole, 'user', 'userRole should be set from token');
  assert.equal(nextCalled, true, 'next should be called');
});

test('verifyToken: sets role to admin when present in token', () => {
  const token = jwt.sign({ userId: '456', role: 'admin' }, JWT_SECRET);
  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };

  const res = {
    status: () => {
      throw new Error('Should not call status on valid token');
    },
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  verifyToken(req, res, next);

  assert.equal(req.userId, '456', 'userId should be set from token');
  assert.equal(req.userRole, 'admin', 'userRole should be set to admin');
  assert.equal(nextCalled, true, 'next should be called');
});

test('verifyToken: handles token without Bearer prefix', () => {
  const token = jwt.sign({ userId: '789', role: 'user' }, JWT_SECRET);
  const req = {
    headers: {
      authorization: token,
    },
  };

  const res = {
    status: () => {
      throw new Error('Should not call status on valid token');
    },
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  verifyToken(req, res, next);

  assert.equal(req.userId, '789', 'userId should be extracted');
  assert.equal(nextCalled, true, 'next should be called');
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
