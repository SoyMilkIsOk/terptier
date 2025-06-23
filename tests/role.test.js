const { test } = require('node:test');
const assert = require('node:assert/strict');
require('ts-node/register');
const { getRoleForEmail } = require('../src/utils/role.ts');

test('returns ADMIN for admin email', () => {
  process.env.ADMIN_EMAIL = 'admin@example.com';
  assert.equal(getRoleForEmail('admin@example.com'), 'ADMIN');
});

test('returns USER for non-admin email', () => {
  process.env.ADMIN_EMAIL = 'admin@example.com';
  assert.equal(getRoleForEmail('user@example.com'), 'USER');
});
