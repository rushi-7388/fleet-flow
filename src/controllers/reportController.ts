import { Request, Response, NextFunction } from 'express';
import { reportService, ReportFilters } from '../services/reportService';

function parseFilters(req: Request): ReportFilters {
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
  const vehicleId = req.query.vehicleId as string | undefined;
  const driverId = req.query.driverId as string | undefined;
  return { startDate, endDate, vehicleId, driverId };
}

export async function getTripsReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = parseFilters(req);
    const data = await reportService.getTripsReportData(filters);
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function exportTripsCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = parseFilters(req);
    const data = await reportService.getTripsReportData(filters);
    const csv = reportService.toCSV(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=trips-report.csv');
    res.send(csv);
  } catch (e) {
    next(e);
  }
}

export async function exportTripsPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = parseFilters(req);
    const data = await reportService.getTripsReportData(filters);
    const pdf = reportService.tripsToPDF(data, filters);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=trips-report.pdf');
    res.send(pdf);
  } catch (e) {
    next(e);
  }
}

export async function getExpensesReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = parseFilters(req);
    const data = await reportService.getExpensesReportData(filters);
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function exportExpensesCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = parseFilters(req);
    const { combined } = await reportService.getExpensesReportData(filters);
    const csv = reportService.toCSV(combined);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses-report.csv');
    res.send(csv);
  } catch (e) {
    next(e);
  }
}

export async function exportExpensesPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = parseFilters(req);
    const data = await reportService.getExpensesReportData(filters);
    const pdf = reportService.expensesToPDF(data, filters);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses-report.pdf');
    res.send(pdf);
  } catch (e) {
    next(e);
  }
}

export async function getDriverPerformanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = parseFilters(req);
    const data = await reportService.getDriverPerformanceReportData(filters);
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function exportDriverPerformanceCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = parseFilters(req);
    const data = await reportService.getDriverPerformanceReportData(filters);
    const csv = reportService.toCSV(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=driver-performance.csv');
    res.send(csv);
  } catch (e) {
    next(e);
  }
}

export async function exportDriverPerformancePDF(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = parseFilters(req);
    const data = await reportService.getDriverPerformanceReportData(filters);
    const pdf = reportService.driverPerformanceToPDF(data, filters);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=driver-performance.pdf');
    res.send(pdf);
  } catch (e) {
    next(e);
  }
}
