import request from 'supertest';
import app from '../server';
import { prisma } from '../models/prisma';

let token: string;
let otherToken: string;

beforeAll(async () => {
  await prisma.$connect();
  await prisma.project.deleteMany({ where: { owner: { email: { contains: '@proj-test.taskflow' } } } });
  await prisma.user.deleteMany({ where: { email: { contains: '@proj-test.taskflow' } } });

  const res = await request(app).post('/api/auth/register').send({
    name: 'Project Owner', email: 'projowner@proj-test.taskflow', password: 'Password1',
  });
  token = res.body.data.accessToken;

  const res2 = await request(app).post('/api/auth/register').send({
    name: 'Other User', email: 'other@proj-test.taskflow', password: 'Password1',
  });
  otherToken = res2.body.data.accessToken;
});

afterAll(async () => {
  await prisma.project.deleteMany({ where: { owner: { email: { contains: '@proj-test.taskflow' } } } });
  await prisma.user.deleteMany({ where: { email: { contains: '@proj-test.taskflow' } } });
  await prisma.$disconnect();
});

// ─── POST /api/projects ───────────────────────────────────────────────────────

describe('POST /api/projects', () => {
  it('creates project and returns 201 with data', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Project', description: 'A test project' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('My Project');
    expect(res.body.data.ownerId).toBeDefined();
    expect(res.body.data.memberCount).toBe(1);
    expect(res.body.data.taskCount).toBe(0);
  });

  it('returns 400 for name too short', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'AB' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing name', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'No name' });
    expect(res.status).toBe(400);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'Unauthorized' });
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/projects ────────────────────────────────────────────────────────

describe('GET /api/projects', () => {
  it('returns list of projects for the authenticated user', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('does not return projects the user is not a member of', async () => {
    const myProjects = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${otherToken}`);
    const ids = myProjects.body.data.map((p: { id: string }) => p.id);

    const ownerProjects = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);

    for (const p of ownerProjects.body.data) {
      expect(ids).not.toContain(p.id);
    }
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/projects/:id ────────────────────────────────────────────────────

describe('GET /api/projects/:id', () => {
  let projectId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Get By Id Project' });
    projectId = res.body.data.id;
  });

  it('returns project by id for a member', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(projectId);
  });

  it('returns 404 for non-member trying to access', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for non-existent project id', async () => {
    const res = await request(app)
      .get('/api/projects/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

// ─── PUT /api/projects/:id ────────────────────────────────────────────────────

describe('PUT /api/projects/:id', () => {
  let projectId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Edit Me Project' });
    projectId = res.body.data.id;
  });

  it('updates project name and returns updated data', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
  });

  it('returns 403 when non-owner tries to update', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ name: 'Hacked' });
    expect(res.status).toBe(403);
  });

  it('returns 400 for name too short', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'AB' });
    expect(res.status).toBe(400);
  });
});

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────────

describe('DELETE /api/projects/:id', () => {
  let projectId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Delete Me Project' });
    projectId = res.body.data.id;
  });

  it('returns 403 when non-owner tries to delete', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  it('deletes project and returns 200', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Project deleted');
  });

  it('returns 403 after deletion (project gone, no membership)', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
