import { Request, Response, NextFunction } from 'express';
import { tripService } from '../services/tripService';
import { TripStatus } from '@prisma/client';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = req.query.status as TripStatus | undefined;
    const vehicleId = req.query.vehicleId as string | undefined;
    const driverId = req.query.driverId as string | undefined;
    const trips = await tripService.findAll({ status, vehicleId, driverId });
    res.json(trips);
  } catch (e) {
    next(e);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const trip = await tripService.findById(req.params.id);
    res.json(trip);
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const trip = await tripService.create(req.body);
    res.status(201).json(trip);
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const trip = await tripService.update(req.params.id, req.body);
    res.json(trip);
  } catch (e) {
    next(e);
  }
}

export async function dispatch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const trip = await tripService.dispatch(req.params.id);
    res.json(trip);
  } catch (e) {
    next(e);
  }
}

export async function complete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const trip = await tripService.complete(req.params.id, req.body);
    res.json(trip);
  } catch (e) {
    next(e);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const trip = await tripService.cancel(req.params.id);
    res.json(trip);
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await tripService.delete(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
