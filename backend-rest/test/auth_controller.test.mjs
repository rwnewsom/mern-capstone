import { test } from 'node:test';
import assert from 'node:assert';
import { validateAuthInput } from '../auth_controller.mjs';

test('Auth Validation Tests', async (t) => {
  await t.test('validateAuthInput returns error for missing email', () => {
    const { isValid, errors } = validateAuthInput('', 'testuser', 'password123');
    assert.strictEqual(isValid, false);
    assert(errors.some((e) => e.includes('Email')));
  });

  await t.test('validateAuthInput returns error for invalid email format', () => {
    const { isValid, errors } = validateAuthInput('invalid-email', 'testuser', 'password123');
    assert.strictEqual(isValid, false);
    assert(errors.some((e) => e.includes('valid email')));
  });

  await t.test('validateAuthInput returns error for missing username', () => {
    const { isValid, errors } = validateAuthInput('test@example.com', '', 'password123');
    assert.strictEqual(isValid, false);
    assert(errors.some((e) => e.includes('Username')));
  });

  await t.test('validateAuthInput returns error for username < 3 characters', () => {
    const { isValid, errors } = validateAuthInput('test@example.com', 'ab', 'password123');
    assert.strictEqual(isValid, false);
    assert(errors.some((e) => e.includes('3 characters')));
  });

  await t.test('validateAuthInput returns error for username > 30 characters', () => {
    const longUsername = 'a'.repeat(31);
    const { isValid, errors } = validateAuthInput('test@example.com', longUsername, 'password123');
    assert.strictEqual(isValid, false);
    assert(errors.some((e) => e.includes('30 characters')));
  });

  await t.test('validateAuthInput returns error for invalid username characters', () => {
    const { isValid, errors } = validateAuthInput('test@example.com', 'Test User!', 'password123');
    assert.strictEqual(isValid, false);
    assert(errors.some((e) => e.includes('lowercase letters, numbers, underscores, and hyphens')));
  });

  await t.test('validateAuthInput returns error for missing password', () => {
    const { isValid, errors } = validateAuthInput('test@example.com', 'testuser', '');
    assert.strictEqual(isValid, false);
    assert(errors.some((e) => e.includes('Password')));
  });

  await t.test('validateAuthInput returns error for password < 6 characters', () => {
    const { isValid, errors } = validateAuthInput('test@example.com', 'testuser', 'pass');
    assert.strictEqual(isValid, false);
    assert(errors.some((e) => e.includes('6 characters')));
  });

  await t.test('validateAuthInput returns error when email is not a string', () => {
    const { isValid, errors } = validateAuthInput(123, 'testuser', 'password123');
    assert.strictEqual(isValid, false);
    assert(errors.some((e) => e.includes('string')));
  });

  await t.test('validateAuthInput returns error when username is not a string', () => {
    const { isValid, errors } = validateAuthInput('test@example.com', 123, 'password123');
    assert.strictEqual(isValid, false);
    assert(errors.some((e) => e.includes('Username')));
  });

  await t.test('validateAuthInput returns error when password is not a string', () => {
    const { isValid, errors } = validateAuthInput('test@example.com', 'testuser', 123);
    assert.strictEqual(isValid, false);
    assert(errors.some((e) => e.includes('string')));
  });

  await t.test('validateAuthInput returns isValid true for valid inputs', () => {
    const { isValid, errors } = validateAuthInput('test@example.com', 'testuser', 'password123');
    assert.strictEqual(isValid, true);
    assert.strictEqual(errors.length, 0);
  });

  await t.test('validateAuthInput accepts valid email formats', () => {
    const testEmails = [
      'user@example.com',
      'user.name@example.co.uk',
      'user+tag@example.com',
      'user-name@example.com',
    ];

    testEmails.forEach((email) => {
      const { isValid } = validateAuthInput(email, 'testuser', 'password123');
      assert.strictEqual(isValid, true, `Should accept ${email}`);
    });
  });

  await t.test('validateAuthInput rejects invalid email formats', () => {
    const invalidEmails = ['user@', '@example.com', 'user @example.com', 'user@example'];

    invalidEmails.forEach((email) => {
      const { isValid } = validateAuthInput(email, 'testuser', 'password123');
      assert.strictEqual(isValid, false, `Should reject ${email}`);
    });
  });

  await t.test('validateAuthInput accepts valid username formats', () => {
    const validUsernames = ['user123', 'test_user', 'user-name', 'abc'];

    validUsernames.forEach((username) => {
      const { isValid } = validateAuthInput('test@example.com', username, 'password123');
      assert.strictEqual(isValid, true, `Should accept ${username}`);
    });
  });

  await t.test('validateAuthInput accepts password exactly 6 characters', () => {
    const { isValid } = validateAuthInput('test@example.com', 'testuser', '123456');
    assert.strictEqual(isValid, true);
  });

  await t.test('validateAuthInput rejects password 5 characters', () => {
    const { isValid } = validateAuthInput('test@example.com', 'testuser', '12345');
    assert.strictEqual(isValid, false);
  });

  await t.test('validateAuthInput handles edge case: email with spaces gets trimmed', () => {
    const { isValid } = validateAuthInput('  test@example.com  ', 'testuser', 'password123');
    assert.strictEqual(isValid, true);
  });

  await t.test('validateAuthInput handles edge case: username with spaces gets trimmed', () => {
    const { isValid } = validateAuthInput('test@example.com', '  testuser  ', 'password123');
    assert.strictEqual(isValid, true);
  });

  await t.test('validateAuthInput handles multiple validation errors', () => {
    const { isValid, errors } = validateAuthInput('invalid', 'ab', '123');
    assert.strictEqual(isValid, false);
    assert(errors.length > 1);
  });
});
