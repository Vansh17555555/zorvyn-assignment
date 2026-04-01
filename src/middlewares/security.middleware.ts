import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Configure Helmet for basic security headers.
 */
export const securityMiddleware = helmet();

/**
 * Auth rate limiter for login/signup.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Dashboard rate limiter for aggregation queries.
 */
export const dashboardRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute for dashboard stats
  message: 'Too many dashboard requests, please wait a minute',
});
