import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as Parameters<typeof authService.register>[0];
    const user = await authService.register(data);
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as Parameters<typeof authService.login>[0];
    const result = await authService.login(data);
    res.json(result);
  } catch (e) {
    next(e);
  }
}
