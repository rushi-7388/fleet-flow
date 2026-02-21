import { Request, Response, NextFunction } from 'express';
import { vehicleService } from '../services/vehicleService';
import { VehicleStatus, VehicleType } from '@prisma/client';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = req.query.status as VehicleStatus | undefined;
    const type = req.query.type as VehicleType | undefined;
    const region = req.query.region as string | undefined;
    const vehicles = await vehicleService.findAll({ status, type, region });
    res.json(vehicles);
  } catch (e) {
    next(e);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicle = await vehicleService.findById(req.params.id);
    res.json(vehicle);
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicle = await vehicleService.create(req.body);
    res.status(201).json(vehicle);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicle = await vehicleService.update(req.params.id, req.body);
    res.json(vehicle);
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await vehicleService.delete(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
