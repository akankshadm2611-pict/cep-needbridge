/**
 * server/middleware/errorHandler.ts — Global error handler.
 */
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
  const message =
    env.NODE_ENV === 'production'
      ? statusCode >= 500 ? 'An unexpected error occurred. Please try again.' : err.message
      : err.message;

  res.status(statusCode).json({
    ok: false,
    error: message,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.path}` });
}
