import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  loginSchema,
  verifySchema,
  updateProfileSchema,
  changePasswordSchema
} from '../src/validations/user.validation.js';
import { USER_ROLES, USER_ROLES_ARRAY } from '../src/constants/roles.js';
import { extractToken } from '../src/middlewares/auth.middleware.js';
import app from '../src/app.js';

test('1. Role constants & values validation', () => {
  assert.equal(USER_ROLES.KEPALA_SEKOLAH, 'KEPALA_SEKOLAH');
  assert.equal(USER_ROLES.GURU, 'GURU');
  assert.equal(USER_ROLES.TU, 'TU');
  assert.equal(USER_ROLES.SISWA, 'SISWA');
  assert.ok(USER_ROLES_ARRAY.includes('ADMIN'));
  assert.ok(USER_ROLES_ARRAY.includes('ORANG_TUA'));
  assert.ok(USER_ROLES_ARRAY.includes('BENDAHARA'));
  assert.ok(USER_ROLES_ARRAY.includes('BK'));
});

test('2. Zod validation schema for /login', () => {
  const valid = loginSchema.safeParse({ username: 'kepsek', password: 'Password123!' });
  assert.equal(valid.success, true);

  const missingUsername = loginSchema.safeParse({ password: 'Password123!' });
  assert.equal(missingUsername.success, false);

  const emptyUsername = loginSchema.safeParse({ username: '   ', password: 'Password123!' });
  assert.equal(emptyUsername.success, false);

  const missingPassword = loginSchema.safeParse({ username: 'kepsek' });
  assert.equal(missingPassword.success, false);
});

test('3. Zod validation schema for /verify', () => {
  const valid = verifySchema.safeParse({ access_token: 'valid.jwt.token' });
  assert.equal(valid.success, true);

  const emptyToken = verifySchema.safeParse({ access_token: '' });
  assert.equal(emptyToken.success, false);
});

test('4. Zod validation schema for updateProfile (PUT /profile)', () => {
  // Valid profile update (nama_lengkap)
  const validName = updateProfileSchema.safeParse({ nama_lengkap: 'Nama Baru' });
  assert.equal(validName.success, true);

  // Valid profile update (email & no_hp)
  const validEmail = updateProfileSchema.safeParse({
    email: 'baru@sekolah.sch.id',
    no_hp: '081299998888',
    jenis_kelamin: 'PEREMPUAN'
  });
  assert.equal(validEmail.success, true);

  // Invalid email format
  const invalidEmail = updateProfileSchema.safeParse({ email: 'bukan-email' });
  assert.equal(invalidEmail.success, false);

  // Invalid gender
  const invalidGender = updateProfileSchema.safeParse({ jenis_kelamin: 'ALIEN' });
  assert.equal(invalidGender.success, false);

  // Empty fields (no profile fields provided)
  const emptyUpdate = updateProfileSchema.safeParse({});
  assert.equal(emptyUpdate.success, false);

  // Only access_token provided without any profile fields to update
  const onlyToken = updateProfileSchema.safeParse({ access_token: 'xyz' });
  assert.equal(onlyToken.success, false);
});

test('5. Zod validation schema for changePassword (PUT /password)', () => {
  // Valid change password
  const validPass = changePasswordSchema.safeParse({
    old_password: 'Password123!',
    new_password: 'NewPassword456!'
  });
  assert.equal(validPass.success, true);

  // New password same as old password
  const samePass = changePasswordSchema.safeParse({
    old_password: 'Password123!',
    new_password: 'Password123!'
  });
  assert.equal(samePass.success, false);

  // New password too short (< 6 chars)
  const shortPass = changePasswordSchema.safeParse({
    old_password: 'Password123!',
    new_password: '123'
  });
  assert.equal(shortPass.success, false);

  // Missing old password
  const missingOld = changePasswordSchema.safeParse({
    new_password: 'NewPassword456!'
  });
  assert.equal(missingOld.success, false);
});

test('6. Token extraction helper from Header, Cookie, and Body', () => {
  // From Bearer header
  const reqHeader = { headers: { authorization: 'Bearer my-token-123' } };
  assert.equal(extractToken(reqHeader), 'my-token-123');

  // From plain header
  const reqPlainHeader = { headers: { authorization: 'my-token-plain' } };
  assert.equal(extractToken(reqPlainHeader), 'my-token-plain');

  // From Cookie access_token
  const reqCookie = { cookies: { access_token: 'cookie-token-abc' } };
  assert.equal(extractToken(reqCookie), 'cookie-token-abc');

  // From Cookie token fallback
  const reqCookieFallback = { cookies: { token: 'cookie-token-fallback' } };
  assert.equal(extractToken(reqCookieFallback), 'cookie-token-fallback');

  // From Body
  const reqBody = { body: { access_token: 'body-token-xyz' } };
  assert.equal(extractToken(reqBody), 'body-token-xyz');

  // When no token is present
  const reqEmpty = { headers: {}, cookies: {}, body: {} };
  assert.equal(extractToken(reqEmpty), null);
});

test('7. JWT token generation & verification simulation', () => {
  const secret = 'test_jwt_secret';
  const dummyUser = {
    id: 'b6f95c02-3c87-433b-a25e-3c2fa4b80b0f',
    username: 'kepsek',
    role: USER_ROLES.KEPALA_SEKOLAH
  };

  const token = jwt.sign(dummyUser, secret, { expiresIn: '1h' });
  assert.ok(token);

  const decoded = jwt.verify(token, secret);
  assert.equal(decoded.id, dummyUser.id);
  assert.equal(decoded.username, 'kepsek');
  assert.equal(decoded.role, 'KEPALA_SEKOLAH');

  assert.throws(() => {
    jwt.verify(token, 'wrong_secret');
  });
});

test('8. Bcrypt password hashing & compare', async () => {
  const plainPassword = 'Password123!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);

  assert.ok(hash);
  assert.notEqual(hash, plainPassword);

  const isMatch = await bcrypt.compare(plainPassword, hash);
  assert.equal(isMatch, true);

  const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
  assert.equal(isWrongMatch, false);
});

test('9. HTTP Server & Endpoints Integration (Health, 404, Zod Error, Token Missing)', async () => {
  process.env.JWT_SECRET = 'test_jwt_secret_integration';

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // Health check
    const resHealth = await fetch(`${baseUrl}/health`);
    assert.equal(resHealth.status, 200);

    // 404 Not Found
    const res404 = await fetch(`${baseUrl}/api/user/tidak-ada`);
    assert.equal(res404.status, 404);

    // POST /login validation failure (empty body)
    const resLoginInvalid = await fetch(`${baseUrl}/api/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(resLoginInvalid.status, 400);

    // PUT /profile without token -> 401 Unauthorized
    const resProfileNoToken = await fetch(`${baseUrl}/api/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama_lengkap: 'Nama Baru' })
    });
    assert.equal(resProfileNoToken.status, 401);
    const bodyProfileNoToken = await resProfileNoToken.json();
    assert.ok(bodyProfileNoToken.message.includes('Autentikasi gagal'));

    // PUT /password without token -> 401 Unauthorized
    const resPasswordNoToken = await fetch(`${baseUrl}/api/user/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_password: '123', new_password: '456' })
    });
    assert.equal(resPasswordNoToken.status, 401);

    // PUT /password with invalid token in Cookie
    const resPasswordBadCookie = await fetch(`${baseUrl}/api/user/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'access_token=bad.jwt.token'
      },
      body: JSON.stringify({ old_password: '123', new_password: '456' })
    });
    assert.equal(resPasswordBadCookie.status, 401);
    const bodyBadCookie = await resPasswordBadCookie.json();
    assert.equal(bodyBadCookie.message, 'access_token tidak valid');
  } finally {
    server.close();
  }
});
