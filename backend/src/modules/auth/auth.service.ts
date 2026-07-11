import prisma from '../../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createError } from '../../middleware/errorHandler';

const SALT_ROUNDS = 10;

export async function registerUser(email: string, password: string) {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError('Invalid email format', 400);
  }

  // Validate password length
  if (!password || password.length < 6) {
    throw createError('Password must be at least 6 characters', 400);
  }

  // Check for duplicate email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw createError('Email already in use', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  if (!email || !password) {
    throw createError('Email and password are required', 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createError('Invalid credentials', 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw createError('Invalid credentials', 401);
  }

  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: { id: user.id, email: user.email, role: user.role },
  };
}
