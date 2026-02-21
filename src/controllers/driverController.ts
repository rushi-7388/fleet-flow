import { Request, Response, NextFunction } from 'express';
import { driverService } from '../services/driverService';
import { DriverStatus } from '@prisma/client';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = req.query.status as DriverStatus | undefined;
    const drivers = await driverService.findAll({ status });
    res.json(drivers);
  } catch (e) {
    next(e);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const driver = await driverService.findById(req.params.id);
    res.json(driver);
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const driver = await driverService.create(req.body);
    res.status(201).json(driver);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const driver = await driverService.update(req.params.id, req.body);
    res.json(driver);
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await driverService.delete(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
