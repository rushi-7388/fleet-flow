import { Request, Response, NextFunction } from 'express';
import { expenseService } from '../services/expenseService';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicleId = req.query.vehicleId as string | undefined;
    const tripId = req.query.tripId as string | undefined;
    const expenses = await expenseService.findAll(vehicleId, tripId);
    res.json(expenses);
  } catch (e) {
    next(e);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const expense = await expenseService.findById(req.params.id);
    res.json(expense);
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const expense = await expenseService.create(req.body);
    res.status(201).json(expense);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const expense = await expenseService.update(req.params.id, req.body);
    res.json(expense);
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await expenseService.delete(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
