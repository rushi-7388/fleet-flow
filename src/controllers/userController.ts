import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';

export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await userService.findAll();
    res.json(users);
  } catch (e) {
    next(e);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.findById(req.params.id);
    res.json(user);
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userService.update(req.params.id, req.body);
    res.json(user);
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await userService.delete(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
