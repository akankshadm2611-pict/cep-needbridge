/**
 * server/middleware/validate.ts — Zod request validation middleware.
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema, target: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const formatted: Record<string, string[]> = {};
      const messages: string[] = [];
      result.error.issues.forEach(issue => {
        const path = issue.path.join('.') || '_root';
        formatted[path] = formatted[path] || [];
        formatted[path].push(issue.message);
        messages.push(`${path !== '_root' ? path + ': ' : ''}${issue.message}`);
      });
      const errorMessage = messages.length > 0 ? messages.join('. ') : 'Validation failed';
      res.status(422).json({ ok: false, error: errorMessage, details: formatted });
      return;
    }
    req[target] = result.data;
    next();
  };
}
