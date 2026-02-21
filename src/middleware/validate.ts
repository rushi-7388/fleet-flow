import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodTypeDef } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate<T>(schema: ZodSchema<T, ZodTypeDef, unknown>, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const value = req[target];
    const result = schema.safeParse(value);
    if (!result.success) {
      next(result.error);
      return;
    }
    (req as unknown as Record<string, unknown>)[target] = result.data;
    next();
  };
}
