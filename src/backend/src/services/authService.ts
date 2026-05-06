import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../models/prisma';
import { AppError } from '../utils/AppError';

const ACCESS_TTL = '15m';
const REFRESH_TTL_DAYS = 7;

export function generateAccessToken(userId: string, isAdmin = false): string {
  return jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET!, { expiresIn: ACCESS_TTL });
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const jti = uuidv4();
  const token = jwt.sign({ userId, jti }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: `${REFRESH_TTL_DAYS}d`,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TTL_DAYS);

  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  return token;
}

export async function register(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, email: true, name: true, avatarUrl: true, isAdmin: true, isActive: true, createdAt: true },
  });

  const accessToken = generateAccessToken(user.id, user.isAdmin);
  const refreshToken = await generateRefreshToken(user.id);
  return { user, accessToken, refreshToken };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('Account is disabled', 401, 'ACCOUNT_DISABLED');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const { password: _, ...safeUser } = user;
  const accessToken = generateAccessToken(user.id, user.isAdmin);
  const refreshToken = await generateRefreshToken(user.id);
  return { user: safeUser, accessToken, refreshToken };
}

export async function refresh(token: string) {
  let payload: { userId: string };
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
  } catch {
    throw new AppError('Invalid refresh token', 401, 'TOKEN_INVALID');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token expired', 401, 'TOKEN_EXPIRED');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  const accessToken = generateAccessToken(payload.userId, user?.isAdmin ?? false);
  return { accessToken };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, avatarUrl: true, isAdmin: true, isActive: true, createdAt: true },
  });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return user;
}

export async function updateUser(userId: string, data: { name?: string; password?: string; currentPassword?: string }) {
  if (data.password) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const valid = await bcrypt.compare(data.currentPassword ?? '', user.password);
    if (!valid) throw new AppError('Current password incorrect', 400, 'WRONG_PASSWORD');

    data.password = await bcrypt.hash(data.password, 12);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { name: data.name, ...(data.password && { password: data.password }) },
    select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
  });
}
