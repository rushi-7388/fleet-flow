import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService';

export async function getDashboardKpis(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const kpis = await analyticsService.getDashboardKpis();
    res.json(kpis);
  } catch (e) {
    next(e);
  }
}

export async function getVehicleAnalytics(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await analyticsService.getVehicleAnalytics();
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function getMonthlySummaries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const start = req.query.start ? new Date(req.query.start as string) : undefined;
    const end = req.query.end ? new Date(req.query.end as string) : undefined;
    const data = await analyticsService.getMonthlySummaries(start, end);
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function getUtilizationSeries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const start = req.query.start ? new Date(req.query.start as string) : undefined;
    const end = req.query.end ? new Date(req.query.end as string) : undefined;
    const data = await analyticsService.getUtilizationSeries(start, end);
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function getFuelEfficiencyByVehicle(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await analyticsService.getFuelEfficiencyByVehicle();
    res.json(data);
  } catch (e) {
    next(e);
  }
}
