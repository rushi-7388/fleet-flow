import { prisma } from '../lib/prisma';
import { jsPDF } from 'jspdf';

function toCSVManual(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const escape = (v: unknown) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const keys = Object.keys(rows[0]!);
  const header = keys.map(escape).join(',');
  const lines = rows.map((r) => keys.map((k) => escape(r[k])).join(','));
  return [header, ...lines].join('\r\n');
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  vehicleId?: string;
  driverId?: string;
}

async function applyTripFilters(filters: ReportFilters) {
  const where: Record<string, unknown> = {};
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) (where.createdAt as Record<string, Date>).gte = filters.startDate;
    if (filters.endDate) (where.createdAt as Record<string, Date>).lte = filters.endDate;
  }
  if (filters.vehicleId) where.vehicleId = filters.vehicleId;
  if (filters.driverId) where.driverId = filters.driverId;
  return where;
}

export const reportService = {
  async getTripsReportData(filters: ReportFilters) {
    const where = await applyTripFilters(filters);
    const trips = await prisma.trip.findMany({
      where,
      include: {
        vehicle: { select: { name: true, licensePlate: true, type: true } },
        driver: { select: { name: true, licenseType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return trips.map((t) => ({
      id: t.id,
      status: t.status,
      origin: t.origin,
      destination: t.destination,
      cargoWeight: t.cargoWeight,
      startOdometer: t.startOdometer,
      endOdometer: t.endOdometer,
      revenue: t.revenue,
      vehicleName: t.vehicle.name,
      licensePlate: t.vehicle.licensePlate,
      vehicleType: t.vehicle.type,
      driverName: t.driver.name,
      driverLicenseType: t.driver.licenseType,
      createdAt: t.createdAt.toISOString(),
    }));
  },

  async getExpensesReportData(filters: ReportFilters) {
    const whereVehicle = filters.vehicleId ? { vehicleId: filters.vehicleId } : {};
    const dateFilter: Record<string, Date> = {};
    if (filters.startDate) dateFilter.gte = filters.startDate;
    if (filters.endDate) dateFilter.lte = filters.endDate;
    const dateWhere = Object.keys(dateFilter).length ? { date: dateFilter } : {};

    const [fuelLogs, maintenanceLogs] = await Promise.all([
      prisma.fuelLog.findMany({
        where: { ...whereVehicle, ...dateWhere },
        include: { vehicle: { select: { name: true, licensePlate: true } } },
        orderBy: { date: 'desc' },
      }),
      prisma.maintenanceLog.findMany({
        where: { ...whereVehicle, ...dateWhere },
        include: { vehicle: { select: { name: true, licensePlate: true } } },
        orderBy: { date: 'desc' },
      }),
    ]);

    const fuelRows = fuelLogs.map((f) => ({
      type: 'Fuel',
      vehicleName: f.vehicle.name,
      licensePlate: f.vehicle.licensePlate,
      date: f.date.toISOString().split('T')[0],
      liters: f.liters,
      cost: f.cost,
      description: '',
    }));
    const maintenanceRows = maintenanceLogs.map((m) => ({
      type: 'Maintenance',
      vehicleName: m.vehicle.name,
      licensePlate: m.vehicle.licensePlate,
      date: m.date.toISOString().split('T')[0],
      liters: '',
      cost: m.cost,
      description: m.description,
    }));
    return { fuel: fuelRows, maintenance: maintenanceRows, combined: [...fuelRows, ...maintenanceRows] };
  },

  async getDriverPerformanceReportData(filters: ReportFilters) {
    const tripWhere: Record<string, unknown> = { status: 'Completed' };
    if (filters.startDate || filters.endDate) {
      tripWhere.createdAt = {};
      if (filters.startDate) (tripWhere.createdAt as Record<string, Date>).gte = filters.startDate!;
      if (filters.endDate) (tripWhere.createdAt as Record<string, Date>).lte = filters.endDate!;
    }
    if (filters.driverId) tripWhere.driverId = filters.driverId;

    const drivers = await prisma.driver.findMany({
      where: filters.driverId ? { id: filters.driverId } : undefined,
      include: {
        trips: {
          where: tripWhere,
          select: { id: true, revenue: true, cargoWeight: true, createdAt: true },
        },
      },
    });

    return drivers.map((d) => {
      const completedTrips = d.trips;
      const totalRevenue = completedTrips.reduce((s, t) => s + (t.revenue ?? 0), 0);
      const totalCargo = completedTrips.reduce((s, t) => s + t.cargoWeight, 0);
      return {
        driverId: d.id,
        driverName: d.name,
        licenseType: d.licenseType,
        licenseExpiry: d.licenseExpiry.toISOString().split('T')[0],
        safetyScore: d.safetyScore,
        status: d.status,
        completedTrips: completedTrips.length,
        totalRevenue,
        totalCargo,
      };
    });
  },

  toCSV(rows: Record<string, unknown>[]): string {
    return toCSVManual(rows);
  },

  tripsToPDF(trips: Record<string, unknown>[], filters: ReportFilters): Buffer {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(16);
    doc.text('FleetFlow - Trips Report', 14, y);
    y += 10;
    if (filters.startDate || filters.endDate) {
      doc.setFontSize(10);
      doc.text(`Period: ${filters.startDate?.toISOString().split('T')[0] ?? 'any'} to ${filters.endDate?.toISOString().split('T')[0] ?? 'any'}`, 14, y);
      y += 8;
    }
    doc.setFontSize(9);
    const headers = ['Origin', 'Destination', 'Status', 'Revenue', 'Vehicle', 'Driver'];
    const colWidths = [35, 35, 22, 22, 30, 35];
    let x = 14;
    headers.forEach((h, i) => {
      doc.text(h, x, y);
      x += colWidths[i];
    });
    y += 6;
    doc.setFontSize(8);
    trips.slice(0, 25).forEach((t: Record<string, unknown>) => {
      if (y > 270) { doc.addPage(); y = 20; }
      x = 14;
      const row = [
        String(t.origin ?? '').slice(0, 18),
        String(t.destination ?? '').slice(0, 18),
        String(t.status ?? ''),
        String(t.revenue ?? ''),
        String(t.vehicleName ?? ''),
        String(t.driverName ?? '').slice(0, 18),
      ];
      row.forEach((cell, i) => {
        doc.text(cell, x, y);
        x += colWidths[i];
      });
      y += 6;
    });
    return Buffer.from(doc.output('arraybuffer'));
  },

  expensesToPDF(expenses: { fuel: Record<string, unknown>[]; maintenance: Record<string, unknown>[] }, _filters: ReportFilters): Buffer {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(16);
    doc.text('FleetFlow - Fuel & Maintenance Expenses', 14, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Fuel entries: ${expenses.fuel.length} | Maintenance entries: ${expenses.maintenance.length}`, 14, y);
    y += 12;
    doc.setFontSize(9);
    const fuelHeaders = ['Type', 'Vehicle', 'Date', 'Liters', 'Cost'];
    let x = 14;
    fuelHeaders.forEach((h, i) => { doc.text(h, x + i * 38, y); });
    y += 6;
    doc.setFontSize(8);
    expenses.fuel.slice(0, 20).forEach((r: Record<string, unknown>) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text('Fuel', 14, y);
      doc.text(String(r.vehicleName ?? ''), 52, y);
      doc.text(String(r.date ?? ''), 90, y);
      doc.text(String(r.liters ?? ''), 128, y);
      doc.text(String(r.cost ?? ''), 166, y);
      y += 6;
    });
    y += 6;
    doc.setFontSize(9);
    doc.text('Maintenance', 14, y);
    y += 6;
    doc.setFontSize(8);
    expenses.maintenance.slice(0, 15).forEach((r: Record<string, unknown>) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(String(r.vehicleName ?? ''), 14, y);
      doc.text(String(r.date ?? ''), 60, y);
      doc.text(String(r.description ?? '').slice(0, 40), 90, y);
      doc.text(String(r.cost ?? ''), 170, y);
      y += 6;
    });
    return Buffer.from(doc.output('arraybuffer'));
  },

  driverPerformanceToPDF(drivers: Record<string, unknown>[], _filters: ReportFilters): Buffer {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(16);
    doc.text('FleetFlow - Driver Performance', 14, y);
    y += 12;
    doc.setFontSize(9);
    const headers = ['Driver', 'License', 'Expiry', 'Trips', 'Revenue', 'Cargo'];
    let x = 14;
    headers.forEach((h, i) => { doc.text(h, x + i * 32, y); });
    y += 6;
    doc.setFontSize(8);
    drivers.forEach((d: Record<string, unknown>) => {
      if (y > 270) { doc.addPage(); y = 20; }
      x = 14;
      doc.text(String(d.driverName ?? '').slice(0, 14), x, y); x += 32;
      doc.text(String(d.licenseType ?? ''), x, y); x += 32;
      doc.text(String(d.licenseExpiry ?? ''), x, y); x += 32;
      doc.text(String(d.completedTrips ?? ''), x, y); x += 32;
      doc.text(String(d.totalRevenue ?? ''), x, y); x += 32;
      doc.text(String(d.totalCargo ?? ''), x, y);
      y += 6;
    });
    return Buffer.from(doc.output('arraybuffer'));
  },
};
