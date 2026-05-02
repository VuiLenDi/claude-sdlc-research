import { prisma } from '../models/prisma';
import { AppError } from '../utils/AppError';

function formatProject(p: {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { members: number; tasks: number };
}) {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    ownerId: p.ownerId,
    memberCount: p._count.members,
    taskCount: p._count.tasks,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

const include = { _count: { select: { members: true, tasks: true } } } as const;

export async function createProject(
  userId: string,
  data: { name: string; description?: string }
) {
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      ownerId: userId,
      members: { create: { userId, role: 'owner' } },
    },
    include,
  });
  return formatProject(project);
}

export async function getProjects(userId: string) {
  const projects = await prisma.project.findMany({
    where: { members: { some: { userId } } },
    include,
    orderBy: { updatedAt: 'desc' },
  });
  return projects.map(formatProject);
}

export async function getProjectById(id: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id, members: { some: { userId } } },
    include,
  });
  if (!project) throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
  return formatProject(project);
}

export async function updateProject(
  id: string,
  userId: string,
  data: { name?: string; description?: string | null }
) {
  const membership = await prisma.projectMember.findFirst({
    where: { projectId: id, userId, role: { in: ['owner', 'admin'] } },
  });
  if (!membership) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  const project = await prisma.project.update({ where: { id }, data, include });
  return formatProject(project);
}

export async function deleteProject(id: string, userId: string) {
  const membership = await prisma.projectMember.findFirst({
    where: { projectId: id, userId, role: 'owner' },
  });
  if (!membership) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  await prisma.project.delete({ where: { id } });
}
