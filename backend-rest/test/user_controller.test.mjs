import test from 'node:test';
import assert from 'node:assert/strict';
import {
  listUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from '../user_controller.mjs';

// ============================================================================
// USER CONTROLLER TESTS
// ============================================================================

test('user controller: listUsers is a function', () => {
  assert(typeof listUsers === 'function', 'listUsers should be a function');
});

test('user controller: updateUserRole is a function', () => {
  assert(typeof updateUserRole === 'function', 'updateUserRole should be a function');
});

test('user controller: updateUserStatus is a function', () => {
  assert(typeof updateUserStatus === 'function', 'updateUserStatus should be a function');
});

test('user controller: deleteUser is a function', () => {
  assert(typeof deleteUser === 'function', 'deleteUser should be a function');
});

test('user controller: getUserById is a function', () => {
  assert(typeof getUserById === 'function', 'getUserById should be a function');
});

// ============================================================================
// ADMIN SELF-LOCKOUT GUARD TESTS
//
// These call the real controller functions (wrapped by asyncHandler, which
// is safe to invoke directly with just req/res). The guard runs before any
// database call, so no DB or mocking is needed to exercise it.
// ============================================================================

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

test('updateUserRole: an admin cannot change their own role', async () => {
  const req = { params: { id: 'admin-1' }, userId: 'admin-1', body: { role: 'user' } };
  const res = mockRes();

  await updateUserRole(req, res, () => {
    throw new Error('next should not be called');
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.Error, 'Cannot change your own role');
});

test('updateUserStatus: an admin cannot deactivate their own account', async () => {
  const req = { params: { id: 'admin-1' }, userId: 'admin-1', body: { isActive: false } };
  const res = mockRes();

  await updateUserStatus(req, res, () => {
    throw new Error('next should not be called');
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.Error, 'Cannot change your own status');
});

test('deleteUser: an admin cannot delete their own account', async () => {
  const req = { params: { id: 'admin-1' }, userId: 'admin-1' };
  const res = mockRes();

  await deleteUser(req, res, () => {
    throw new Error('next should not be called');
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.Error, 'Cannot delete your own account');
});
