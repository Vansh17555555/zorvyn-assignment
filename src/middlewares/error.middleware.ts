import { Request, Response, NextFunction } from 'express';
import { AppError, HttpCode } from '../utils/errors';
import logger from '../utils/logger';
import { ZodError } from 'zod';

/**
 * Standardized error response format.
 */
interface ErrorResponse {
  status: 'error' | 'fail';
  message: string;
  errors?: any;
  stack?: string;
}

/**
 * Express middleware for centralized error handling.
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = HttpCode.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong';
  let details: any = undefined;

  // Handle Operational AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } 
  // Handle Zod Validation Errors
  else if (error instanceof ZodError) {
    statusCode = HttpCode.BAD_REQUEST;
    message = 'Validation Error';
    details = error.flatten().fieldErrors;
  }

  // Log the error
  const isProd = process.env.NODE_ENV === 'production';
  if (statusCode === HttpCode.INTERNAL_SERVER_ERROR) {
    logger.error('Unexpected Error', { 
      message: error.message, 
      stack: error.stack,
      path: req.path 
    });
  } else {
    logger.warn('Operational Error', { 
      statusCode, 
      message, 
      path: req.path 
    });
  }

  const response: ErrorResponse = {
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(details && { errors: details }),
    ...(!isProd && { stack: error.stack }),
  };

  res.status(statusCode).json(response);
};
