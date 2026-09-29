/**
 * server/middleware/auth.ts — JWT authentication middleware.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UsersRepo } from '../db/repositories/index.js';
import type { UserRole } from '../../shared/types.js';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: UserRole;
}

interface JwtPayload {
  sub: string;   // user id
  role: UserRole;
  iat: number;
  exp: number;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ ok: false, error: 'Authentication required. Please log in.' });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    res.clearCookie('token');
    res.status(401).json({ ok: false, error: 'Session expired. Please log in again.' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ ok: false, error: 'You do not have permission to perform this action.' });
      return;
    }
    next();
  };
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token;
  if (token) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.userId = payload.sub;
      req.userRole = payload.role;
    } catch {
      // Token invalid — continue as unauthenticated
    }
  }
  next();
}

export function signToken(userId: string, role: UserRole): string {
  return jwt.sign({ sub: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}
