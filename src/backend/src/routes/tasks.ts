import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError, asyncHandler } from '../utils/AppError';
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from '../services/taskService';

const router = Router({ mergeParams: true });

router.use(authenticate);

const createSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assigneeId: z.string().uuid().optional(),
  storyPoints: z.number().int().min(1).max(13).optional(),
  dueDate: z.string().datetime().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  storyPoints: z.number().int().min(1).max(13).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  startDate: z.string().date().nullable().optional(),
  endDate: z.string().date().nullable().optional(),
});

router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const body = createSchema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400, 'VALIDATION_ERROR');
    const { dueDate, startDate, endDate, ...rest } = body.data;
    const task = await createTask((req.params as { projectId: string }).projectId, req.userId!, {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
    res.status(201).json({ data: task });
  })
);

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const tasks = await getTasks((req.params as { projectId: string }).projectId, req.userId!);
    res.json({ data: tasks });
  })
);

router.get(
  '/:taskId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const task = await getTaskById(
      (req.params as { projectId: string; taskId: string }).projectId,
      req.params.taskId,
      req.userId!
    );
    res.json({ data: task });
  })
);

router.put(
  '/:taskId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const body = updateSchema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400, 'VALIDATION_ERROR');
    const { dueDate, startDate, endDate, ...rest } = body.data;
    const p = req.params as { projectId: string; taskId: string };
    const task = await updateTask(p.projectId, p.taskId, req.userId!, {
      ...rest,
      dueDate: dueDate === undefined ? undefined : dueDate ? new Date(dueDate) : null,
      startDate: startDate === undefined ? undefined : startDate ? new Date(startDate) : null,
      endDate: endDate === undefined ? undefined : endDate ? new Date(endDate) : null,
    });
    res.json({ data: task });
  })
);

router.delete(
  '/:taskId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const p = req.params as { projectId: string; taskId: string };
    await deleteTask(p.projectId, p.taskId, req.userId!);
    res.json({ message: 'Task deleted' });
  })
);

export default router;
