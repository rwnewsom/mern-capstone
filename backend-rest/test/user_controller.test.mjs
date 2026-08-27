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
