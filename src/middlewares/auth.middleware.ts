import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, HttpCode } from '../utils/errors';
import { Role } from '@prisma/client';
import logger from '../utils/logger';

interface JWTPayload {
  userId: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to authenticate JWT token.
 * Extends the request with user payload.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', HttpCode.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fallback_secret';

    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication Error', { error });
    next(new AppError('Invalid or expired token', HttpCode.UNAUTHORIZED));
  }
};

/**
 * Middleware to authorize based on roles.
 * Supports multiple roles: `authorize(['ADMIN', 'ANALYST'])`
 */
export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', HttpCode.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', { userId: req.user.userId, role: req.user.role, allowedRoles });
      return next(new AppError('Insufficient permissions', HttpCode.FORBIDDEN));
    }

    next();
  };
};
