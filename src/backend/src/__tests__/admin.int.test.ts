import request from 'supertest';
import app from '../server';
import { prisma } from '../models/prisma';
import { generateAccessToken } from '../services/authService';

const NS = '@admin-test.taskflow';

let adminToken: string;
let memberToken: string;
let adminId: string;

beforeAll(async () => {
  await prisma.$connect();
  await prisma.user.deleteMany({ where: { email: { contains: NS } } });

  const admin = await prisma.user.create({
    data: { name: 'Admin', email: `admin${NS}`, password: 'hashed', isAdmin: true },
  });
  adminId = admin.id;
  adminToken = generateAccessToken(admin.id, true);

  const member = await prisma.user.create({
    data: { name: 'Member', email: `member${NS}`, password: 'hashed', isAdmin: false },
  });
  memberToken = generateAccessToken(member.id, false);
});

afterAll(async () => {
  await prisma.adminSetting.deleteMany({ where: { key: 'notification_lead_days' } });
  await prisma.user.deleteMany({ where: { email: { contains: NS } } });
  await prisma.$disconnect();
});

// ─── Admin middleware ─────────────────────────────────────────────────────────

describe('Admin middleware', () => {
  it('returns 403 for non-admin callers', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });
});

// ─── POST /api/admin/users ────────────────────────────────────────────────────

describe('POST /api/admin/users', () => {
  it('creates user and returns 201', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New User', email: `new${NS}`, password: 'Password1' });
    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe(`new${NS}`);
    expect(res.body.data.isActive).toBe(true);
  });

  it('returns 409 for duplicate email', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Dup', email: `new${NS}`, password: 'Password1' });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_EXISTS');
  });

  it('returns 400 for invalid payload', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'X', email: 'not-an-email', password: 'Password1' });
    expect(res.status).toBe(400);
  });
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────

describe('GET /api/admin/users', () => {
  it('returns all users with isActive field', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('isActive');
  });
});

// ─── PATCH /api/admin/users/:id/deactivate ────────────────────────────────────

describe('PATCH /api/admin/users/:id/deactivate', () => {
  let targetId: string;

  beforeAll(async () => {
    const u = await prisma.user.create({
      data: { name: 'Deactivate Me', email: `deactivate${NS}`, password: 'hashed' },
    });
    targetId = u.id;
  });

  it('sets isActive = false', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetId}/deactivate`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it('deactivated user cannot login', async () => {
    await prisma.user.update({
      where: { id: targetId },
      data: { password: '$2a$12$zQmkJ3MKCc.GNR6t.Gt.POyL6T8xPbcH/Q.9dSgkqz3SFoJHOSvne', email: `deactivate${NS}` },
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: `deactivate${NS}`, password: 'Password1' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('ACCOUNT_DISABLED');
  });

  it('returns 404 for unknown user', async () => {
    const res = await request(app)
      .patch('/api/admin/users/00000000-0000-0000-0000-000000000000/deactivate')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

// ─── Admin settings ───────────────────────────────────────────────────────────

describe('Admin settings', () => {
  it('PUT creates/upserts a setting', async () => {
    const res = await request(app)
      .put('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ key: 'notification_lead_days', value: '3' });
    expect(res.status).toBe(200);
    expect(res.body.data.key).toBe('notification_lead_days');
    expect(res.body.data.value).toBe('3');
  });

  it('GET returns persisted settings', async () => {
    const res = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const found = res.body.data.find((s: { key: string }) => s.key === 'notification_lead_days');
    expect(found?.value).toBe('3');
  });
});

// ─── Auth isActive check ──────────────────────────────────────────────────────

describe('Auth login isActive', () => {
  it('active user can login normally', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Active', email: `active-login${NS}`, password: 'Password1' });
    expect(res.status).toBe(201);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: `active-login${NS}`, password: 'Password1' });
    expect(login.status).toBe(200);
  });
});
