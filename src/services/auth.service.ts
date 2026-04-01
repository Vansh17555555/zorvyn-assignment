import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../config/prisma';
import { AppError, HttpCode } from '../utils/errors';
import logger from '../utils/logger';
import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthService {
  /**
   * Register a new user.
   */
  static async signup(data: z.infer<typeof SignupSchema>) {
    const { email, password, role } = SignupSchema.parse(data);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('User already exists', HttpCode.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || Role.VIEWER,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    logger.info(`New user registered: ${email}`);
    return user;
  }

  /**
   * Authenticate a user and return a JWT.
   */
  static async login(data: z.infer<typeof LoginSchema>) {
    const { email, password } = LoginSchema.parse(data);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid email or password', HttpCode.UNAUTHORIZED);
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const expires = process.env.JWT_EXPIRES_IN || '1d';

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      secret,
      { expiresIn: expires as any }
    );

    logger.info(`User logged in: ${email}`);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
