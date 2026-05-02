import request from 'supertest';
import app from '../server';
import { prisma } from '../models/prisma';

beforeAll(async () => {
  await prisma.$connect();
  // wipe any data left over from a previous interrupted run
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany({ where: { email: { contains: '@test.taskflow' } } });
});

afterAll(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany({ where: { email: { contains: '@test.taskflow' } } });
  await prisma.$disconnect();
});

// ─── Register ────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  const payload = { name: 'Test User', email: 'register@test.taskflow', password: 'Password1' };

  it('creates user and returns 201 with accessToken', async () => {
    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(payload.email);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('returns 409 if email already registered', async () => {
    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_EXISTS');
  });

  it('returns 400 for weak password (no number)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...payload, email: 'weak@test.taskflow', password: 'onlyletters' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...payload, email: 'short@test.taskflow', password: 'Ab1' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'noname@test.taskflow', password: 'Password1' });
    expect(res.status).toBe(400);
  });
});

// ─── Login ───────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Tester', email: 'login@test.taskflow', password: 'Password1',
    });
  });

  it('returns 200 with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.taskflow', password: 'Password1' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.taskflow', password: 'WrongPass1' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@test.taskflow', password: 'Password1' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'Password1' });
    expect(res.status).toBe(400);
  });
});

// ─── Logout ──────────────────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  let cookie: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Logout Tester', email: 'logout@test.taskflow', password: 'Password1',
    });
    cookie = res.headers['set-cookie'][0];
  });

  it('returns 200 and clears cookie with valid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out');
    // cookie should be cleared (maxAge=0 or expired)
    const setCookie = res.headers['set-cookie']?.[0] ?? '';
    expect(setCookie).toMatch(/refreshToken=;/);
  });

  it('returns 200 even without a refresh cookie (already logged out)', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
  });
});

// ─── Refresh ─────────────────────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  let cookie: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Refresh Tester', email: 'refresh@test.taskflow', password: 'Password1',
    });
    cookie = res.headers['set-cookie'][0];
  });

  it('returns new accessToken with valid refresh cookie', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
  });

  it('returns 401 without refresh cookie', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid (tampered) refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', 'refreshToken=tampered.invalid.token');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_INVALID');
  });
});

// ─── GET /me ─────────────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Me Tester', email: 'me@test.taskflow', password: 'Password1',
    });
    token = res.body.data.accessToken;
  });

  it('returns user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('me@test.taskflow');
    expect(res.body.data.password).toBeUndefined();
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 with malformed Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer totally.invalid.jwt');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_INVALID');
  });

  it('returns 401 with non-Bearer auth header', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Basic dXNlcjpwYXNz');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });
});

// ─── PUT /me (profile update) ─────────────────────────────────────────────────

describe('PUT /api/auth/me', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Profile Tester', email: 'profile@test.taskflow', password: 'Password1',
    });
    token = res.body.data.accessToken;
  });

  it('updates name successfully', async () => {
    const res = await request(app)
      .put('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
  });

  it('changes password with correct current password', async () => {
    const res = await request(app)
      .put('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Password1', password: 'NewPass456' });
    expect(res.status).toBe(200);
    // verify new password works
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'profile@test.taskflow', password: 'NewPass456' });
    expect(login.status).toBe(200);
  });

  it('returns 400 for wrong current password', async () => {
    const res = await request(app)
      .put('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'WrongOldPass1', password: 'AnotherNew1' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('WRONG_PASSWORD');
  });

  it('returns 400 for new password too short', async () => {
    const res = await request(app)
      .put('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'Ab1' });
    expect(res.status).toBe(400);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .put('/api/auth/me')
      .send({ name: 'Hacker' });
    expect(res.status).toBe(401);
  });
});
