import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../utils/AppError';
import * as projectService from '../services/projectService';
import * as taskService from '../services/taskService';

const router = Router();

const createSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
});

const updateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100).optional(),
  description: z.string().max(500).nullable().optional(),
});

router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }
    const project = await projectService.createProject(req.userId!, parsed.data);
    res.status(201).json({ data: project });
  })
);

router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const projects = await projectService.getProjects(req.userId!);
    res.json({ data: projects });
  })
);

router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const project = await projectService.getProjectById(req.params.id, req.userId!);
    res.json({ data: project });
  })
);

router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }
    const project = await projectService.updateProject(req.params.id, req.userId!, parsed.data);
    res.json({ data: project });
  })
);

router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await projectService.deleteProject(req.params.id, req.userId!);
    res.json({ message: 'Project deleted' });
  })
);

router.get(
  '/:id/members',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const members = await taskService.getProjectMembers(req.params.id, req.userId!);
    res.json({ data: members });
  })
);

export default router;
