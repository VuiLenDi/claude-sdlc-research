import request from 'supertest';
import app from '../server';
import { prisma } from '../models/prisma';

const EMAIL_NS = '@task-test.taskflow';

let ownerToken: string;
let memberToken: string;
let outsiderToken: string;
let projectId: string;
let memberId: string;

beforeAll(async () => {
  await prisma.$connect();
  await prisma.project.deleteMany({ where: { owner: { email: { contains: EMAIL_NS } } } });
  await prisma.user.deleteMany({ where: { email: { contains: EMAIL_NS } } });

  const r1 = await request(app).post('/api/auth/register').send({
    name: 'Task Owner', email: `owner${EMAIL_NS}`, password: 'Password1',
  });
  ownerToken = r1.body.data.accessToken;

  const r2 = await request(app).post('/api/auth/register').send({
    name: 'Task Member', email: `member${EMAIL_NS}`, password: 'Password1',
  });
  memberToken = r2.body.data.accessToken;
  memberId = r2.body.data.user.id;

  const r3 = await request(app).post('/api/auth/register').send({
    name: 'Outsider', email: `outsider${EMAIL_NS}`, password: 'Password1',
  });
  outsiderToken = r3.body.data.accessToken;

  const rp = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ name: 'Task Test Project' });
  projectId = rp.body.data.id;

  // Add member to project
  await prisma.projectMember.create({
    data: { projectId, userId: memberId, role: 'member' },
  });
});

afterAll(async () => {
  await prisma.project.deleteMany({ where: { owner: { email: { contains: EMAIL_NS } } } });
  await prisma.user.deleteMany({ where: { email: { contains: EMAIL_NS } } });
  await prisma.$disconnect();
});

// ─── GET /api/projects/:id/members ───────────────────────────────────────────

describe('GET /api/projects/:id/members', () => {
  it('returns project members for a member', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2); // owner + member
    expect(res.body.data[0]).toMatchObject({ id: expect.any(String), name: expect.any(String) });
  });

  it('returns 404 for non-member', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${outsiderToken}`);
    expect(res.status).toBe(404);
  });
});

// ─── POST /api/projects/:id/tasks ────────────────────────────────────────────

describe('POST /api/projects/:id/tasks', () => {
  it('creates a task with defaults', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'First Task' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('First Task');
    expect(res.body.data.status).toBe('todo');
    expect(res.body.data.priority).toBe('medium');
    expect(res.body.data.reporter).toMatchObject({ name: 'Task Owner' });
  });

  it('creates a task with all fields', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Full Task',
        description: 'Details here',
        priority: 'high',
        assigneeId: memberId,
        storyPoints: 5,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.priority).toBe('high');
    expect(res.body.data.assignee).toMatchObject({ name: 'Task Member' });
    expect(res.body.data.storyPoints).toBe(5);
  });

  it('allows a project member to create a task', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ title: 'Member Task' });
    expect(res.status).toBe(201);
  });

  it('creates a task with startDate and endDate (YYYY-MM-DD)', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Dated Task', startDate: '2026-06-01', endDate: '2026-06-15' });
    expect(res.status).toBe(201);
    expect(res.body.data.startDate).toBeTruthy();
    expect(res.body.data.endDate).toBeTruthy();
  });

  it('returns 400 for empty title', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: '' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for outsider', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send({ title: 'Hack' });
    expect(res.status).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'No auth' });
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/projects/:id/tasks ─────────────────────────────────────────────

describe('GET /api/projects/:id/tasks', () => {
  it('returns task list for a member', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('returns 404 for outsider', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${outsiderToken}`);
    expect(res.status).toBe(404);
  });
});

// ─── GET /api/projects/:id/tasks/:taskId ─────────────────────────────────────

describe('GET /api/projects/:id/tasks/:taskId', () => {
  let taskId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Task to Get', priority: 'high', storyPoints: 3 });
    taskId = res.body.data.id;
  });

  it('returns task detail for a member', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(taskId);
    expect(res.body.data.priority).toBe('high');
  });

  it('returns 404 for outsider', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${outsiderToken}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(404);
  });
});

// ─── PUT /api/projects/:id/tasks/:taskId ─────────────────────────────────────

describe('PUT /api/projects/:id/tasks/:taskId', () => {
  let taskId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Task to Update' });
    taskId = res.body.data.id;
  });

  it('updates task title and status', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Updated Title', status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
    expect(res.body.data.status).toBe('in_progress');
  });

  it('allows member to update task', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ priority: 'critical' });
    expect(res.status).toBe(200);
    expect(res.body.data.priority).toBe('critical');
  });

  it('clears assignee when null is passed', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ assigneeId: null });
    expect(res.status).toBe(200);
    expect(res.body.data.assignee).toBeNull();
  });

  it('clears dueDate when null is passed', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ dueDate: null });
    expect(res.status).toBe(200);
    expect(res.body.data.dueDate).toBeNull();
  });

  it('sets dueDate when a valid datetime string is passed', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ dueDate: '2026-12-31T00:00:00.000Z' });
    expect(res.status).toBe(200);
    expect(res.body.data.dueDate).toBeTruthy();
  });

  it('sets startDate and endDate (YYYY-MM-DD) on update', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ startDate: '2026-07-01', endDate: '2026-07-31' });
    expect(res.status).toBe(200);
    expect(res.body.data.startDate).toBeTruthy();
    expect(res.body.data.endDate).toBeTruthy();
  });

  it('clears startDate and endDate when null is passed', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ startDate: null, endDate: null });
    expect(res.status).toBe(200);
    expect(res.body.data.startDate).toBeNull();
    expect(res.body.data.endDate).toBeNull();
  });

  it('returns 404 for outsider', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send({ title: 'Hack' });
    expect(res.status).toBe(404);
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}/tasks/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Ghost' });
    expect(res.status).toBe(404);
  });
});

// ─── DELETE /api/projects/:id/tasks/:taskId ───────────────────────────────────

describe('DELETE /api/projects/:id/tasks/:taskId', () => {
  let taskId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Task to Delete' });
    taskId = res.body.data.id;
  });

  it('returns 404 for outsider', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${outsiderToken}`);
    expect(res.status).toBe(404);
  });

  it('allows member to delete task', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task deleted');
  });

  it('returns 404 after deletion', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(404);
  });
});
