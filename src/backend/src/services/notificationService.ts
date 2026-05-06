import cron from 'node-cron';
import { prisma } from '../models/prisma';

export async function createStartDateNotifications(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks = await prisma.task.findMany({
    where: {
      startDate: { gte: today, lt: tomorrow },
      assigneeId: { not: null },
    },
    select: { id: true, title: true, assigneeId: true },
  });

  let created = 0;
  for (const task of tasks) {
    try {
      await prisma.notification.create({
        data: {
          userId: task.assigneeId!,
          taskId: task.id,
          type: 'task_start',
          message: `Task "${task.title}" starts today.`,
          notifDate: today,
        },
      });
      created++;
    } catch {
      // unique constraint violation = already notified today; skip
    }
  }
  return created;
}

export function startCronJobs() {
  // Daily at 08:00 UTC
  cron.schedule('0 8 * * *', async () => {
    try {
      const count = await createStartDateNotifications();
      if (count > 0) {
        console.log(`[cron] Created ${count} start-date notification(s)`);
      }
    } catch (err) {
      console.error('[cron] Notification job failed:', err);
    }
  }, { timezone: 'UTC' });
}
