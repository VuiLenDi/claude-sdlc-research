import { Router, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { AppError, asyncHandler } from '../utils/AppError';
import { prisma } from '../models/prisma';

const router = Router();

router.use(authenticate, requireAdmin);

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[a-zA-Z]/)
    .regex(/[0-9]/),
  isAdmin: z.boolean().optional(),
});

const updateSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

// POST /api/admin/users
router.post(
  '/users',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const body = createUserSchema.safeParse(_req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400, 'VALIDATION_ERROR');

    const existing = await prisma.user.findUnique({ where: { email: body.data.email } });
    if (existing) throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');

    const hashed = await bcrypt.hash(body.data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: body.data.name,
        email: body.data.email,
        password: hashed,
        isAdmin: body.data.isAdmin ?? false,
      },
      select: { id: true, email: true, name: true, isAdmin: true, isActive: true, createdAt: true },
    });
    res.status(201).json({ data: user });
  })
);

// GET /api/admin/users
router.get(
  '/users',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, isAdmin: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ data: users });
  })
);

// PATCH /api/admin/users/:id/deactivate
router.patch(
  '/users/:id/deactivate',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false },
      select: { id: true, email: true, name: true, isAdmin: true, isActive: true, createdAt: true },
    });
    res.json({ data: updated });
  })
);

// GET /api/admin/settings
router.get(
  '/settings',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const settings = await prisma.adminSetting.findMany({ orderBy: { key: 'asc' } });
    res.json({ data: settings });
  })
);

// PUT /api/admin/settings
router.put(
  '/settings',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const body = updateSettingSchema.safeParse(_req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400, 'VALIDATION_ERROR');

    const setting = await prisma.adminSetting.upsert({
      where: { key: body.data.key },
      update: { value: body.data.value },
      create: { key: body.data.key, value: body.data.value },
    });
    res.json({ data: setting });
  })
);

export default router;
