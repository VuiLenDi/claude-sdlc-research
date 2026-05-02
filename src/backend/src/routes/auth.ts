import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/AppError';
import { authenticate, AuthRequest } from '../middleware/auth';
import * as authService from '../services/authService';

const router = Router();

const REFRESH_COOKIE = 'refreshToken';
const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[a-zA-Z]/)
    .regex(/[0-9]/),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.register(
      body.name,
      body.email,
      body.password
    );
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
    res.status(201).json({ data: { user, accessToken } });
  })
);

router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.login(
      body.email,
      body.password
    );
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
    res.json({ data: { user, accessToken } });
  })
);

router.post(
  '/logout',
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies[REFRESH_COOKIE];
    if (token) await authService.logout(token);
    res.clearCookie(REFRESH_COOKIE);
    res.json({ data: null, message: 'Logged out' });
  })
);

router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies[REFRESH_COOKIE];
    const { accessToken } = await authService.refresh(token);
    res.json({ accessToken });
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await authService.getUser(req.userId!);
    res.json({ data: user });
  })
);

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  currentPassword: z.string().optional(),
  password: z.string().min(8).optional(),
});

router.put(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const body = updateSchema.parse(req.body);
    const user = await authService.updateUser(req.userId!, body);
    res.json({ data: user });
  })
);

export default router;
