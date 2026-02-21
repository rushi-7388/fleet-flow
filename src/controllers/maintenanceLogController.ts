import { Request, Response, NextFunction } from 'express';
import { maintenanceLogService } from '../services/maintenanceLogService';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicleId = req.query.vehicleId as string | undefined;
    const logs = await maintenanceLogService.findAll(vehicleId);
    res.json(logs);
  } catch (e) {
    next(e);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const log = await maintenanceLogService.findById(req.params.id);
    res.json(log);
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const log = await maintenanceLogService.create(req.body);
    res.status(201).json(log);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const log = await maintenanceLogService.update(req.params.id, req.body);
    res.json(log);
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await maintenanceLogService.delete(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
