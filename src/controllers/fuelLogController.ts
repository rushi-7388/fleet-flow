import { Request, Response, NextFunction } from 'express';
import { fuelLogService } from '../services/fuelLogService';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicleId = req.query.vehicleId as string | undefined;
    const logs = await fuelLogService.findAll(vehicleId);
    res.json(logs);
  } catch (e) {
    next(e);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const log = await fuelLogService.findById(req.params.id);
    res.json(log);
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const log = await fuelLogService.create(req.body);
    res.status(201).json(log);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const log = await fuelLogService.update(req.params.id, req.body);
    res.json(log);
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await fuelLogService.delete(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
