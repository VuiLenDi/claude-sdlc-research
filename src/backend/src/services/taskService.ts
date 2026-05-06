import { TaskPriority, TaskStatus } from '@prisma/client';
import { prisma } from '../models/prisma';
import { AppError } from '../utils/AppError';

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  reporter: { select: { id: true, name: true } },
} as const;

function formatTask(t: {
  id: string;
  projectId: string;
  sprintId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  storyPoints: number | null;
  dueDate: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  assignee: { id: string; name: string; email: string } | null;
  reporter: { id: string; name: string };
}) {
  return {
    id: t.id,
    projectId: t.projectId,
    sprintId: t.sprintId,
    title: t.title,
    description: t.description ?? undefined,
    status: t.status,
    priority: t.priority,
    storyPoints: t.storyPoints,
    dueDate: t.dueDate,
    startDate: t.startDate,
    endDate: t.endDate,
    position: t.position,
    assignee: t.assignee,
    reporter: t.reporter,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

async function assertMember(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findFirst({
    where: { projectId, userId },
  });
  if (!membership) throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
}

export async function getProjectMembers(projectId: string, userId: string) {
  await assertMember(projectId, userId);
  return prisma.projectMember.findMany({
    where: { projectId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: 'asc' },
  }).then(members => members.map(m => m.user));
}

export async function createTask(
  projectId: string,
  reporterId: string,
  data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    storyPoints?: number;
    dueDate?: Date;
    startDate?: Date;
    endDate?: Date;
  }
) {
  await assertMember(projectId, reporterId);
  const task = await prisma.task.create({
    data: {
      projectId,
      reporterId,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority ?? 'medium',
      assigneeId: data.assigneeId,
      storyPoints: data.storyPoints,
      dueDate: data.dueDate,
      startDate: data.startDate,
      endDate: data.endDate,
    },
    include: taskInclude,
  });
  return formatTask(task);
}

export async function getTasks(projectId: string, userId: string) {
  await assertMember(projectId, userId);
  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: taskInclude,
    orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'desc' }],
  });
  return tasks.map(formatTask);
}

export async function getTaskById(projectId: string, taskId: string, userId: string) {
  await assertMember(projectId, userId);
  const task = await prisma.task.findFirst({
    where: { id: taskId, projectId },
    include: taskInclude,
  });
  if (!task) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
  return formatTask(task);
}

export async function updateTask(
  projectId: string,
  taskId: string,
  userId: string,
  data: {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string | null;
    storyPoints?: number | null;
    dueDate?: Date | null;
    startDate?: Date | null;
    endDate?: Date | null;
  }
) {
  await assertMember(projectId, userId);
  const existing = await prisma.task.findFirst({ where: { id: taskId, projectId } });
  if (!existing) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
  const task = await prisma.task.update({
    where: { id: taskId },
    data,
    include: taskInclude,
  });
  return formatTask(task);
}

export async function deleteTask(projectId: string, taskId: string, userId: string) {
  await assertMember(projectId, userId);
  const existing = await prisma.task.findFirst({ where: { id: taskId, projectId } });
  if (!existing) throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
  await prisma.task.delete({ where: { id: taskId } });
}
