import { prisma } from '../models/prisma';
import { createStartDateNotifications } from '../services/notificationService';

const NS = '@notif-test.taskflow';

let userId: string;
let projectId: string;

beforeAll(async () => {
  await prisma.$connect();
  await prisma.user.deleteMany({ where: { email: { contains: NS } } });

  const user = await prisma.user.create({
    data: { name: 'Notif User', email: `notif${NS}`, password: 'hashed' },
  });
  userId = user.id;

  const project = await prisma.project.create({
    data: { name: 'Notif Project', ownerId: userId },
  });
  projectId = project.id;

  await prisma.projectMember.create({ data: { projectId, userId, role: 'owner' } });
});

afterAll(async () => {
  await prisma.notification.deleteMany({ where: { user: { email: { contains: NS } } } });
  await prisma.project.deleteMany({ where: { name: 'Notif Project' } });
  await prisma.user.deleteMany({ where: { email: { contains: NS } } });
  await prisma.$disconnect();
});

describe('createStartDateNotifications', () => {
  it('creates notification for task starting today', async () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const task = await prisma.task.create({
      data: {
        projectId,
        reporterId: userId,
        title: 'Today Task',
        startDate: today,
        assigneeId: userId,
      },
    });

    const count = await createStartDateNotifications();
    expect(count).toBeGreaterThanOrEqual(1);

    const notif = await prisma.notification.findFirst({
      where: { taskId: task.id, type: 'task_start' },
    });
    expect(notif).not.toBeNull();
    expect(notif?.userId).toBe(userId);

    await prisma.task.delete({ where: { id: task.id } });
  });

  it('does not create duplicate notification for same task/type/date', async () => {
    const today = new Date();
    today.setHours(8, 0, 0, 0);
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);

    const task = await prisma.task.create({
      data: {
        projectId,
        reporterId: userId,
        title: 'Dedup Task',
        startDate: today,
        assigneeId: userId,
      },
    });

    await createStartDateNotifications();
    await createStartDateNotifications(); // second call

    const count = await prisma.notification.count({
      where: { taskId: task.id, type: 'task_start' },
    });
    expect(count).toBe(1);

    await prisma.task.delete({ where: { id: task.id } });
  });

  it('skips tasks with no assignee', async () => {
    const today = new Date();
    today.setHours(10, 0, 0, 0);

    const task = await prisma.task.create({
      data: {
        projectId,
        reporterId: userId,
        title: 'No Assignee Task',
        startDate: today,
      },
    });

    const before = await prisma.notification.count({ where: { taskId: task.id } });
    await createStartDateNotifications();
    const after = await prisma.notification.count({ where: { taskId: task.id } });
    expect(after).toBe(before);

    await prisma.task.delete({ where: { id: task.id } });
  });
});
