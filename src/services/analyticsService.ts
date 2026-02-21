import { prisma } from '../lib/prisma';

/** Recharts-friendly: { name, value } or { month, ... } */
export interface DashboardKpis {
  activeFleet: number;
  maintenanceAlerts: number;
  utilizationRate: number; // 0-100, active/total
  pendingCargo: number; // total cargo weight in Draft trips
}

export interface VehicleAnalytics {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  fuelEfficiency: number | null; // km per liter; null if no fuel
  totalOperationalCost: number; // fuel + maintenance
  acquisitionCost: number | null;
  totalRevenue: number;
  roi: number | null; // (revenue - operationalCost) / acquisitionCost; null if no acquisition cost or division issues
}

export interface MonthlySeriesItem {
  month: string; // YYYY-MM
  revenue: number;
  fuelCost: number;
  maintenanceCost: number;
  tripsCount: number;
  totalCargo: number;
}

export interface UtilizationSeriesItem {
  month: string;
  utilizationRate: number;
  activeVehicles: number;
  totalVehicles: number;
}

export interface FuelEfficiencySeriesItem {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  fuelEfficiency: number | null;
  totalLiters: number;
  totalDistance: number;
}

const safeDiv = (a: number, b: number): number | null => {
  if (b === 0 || !Number.isFinite(b)) return null;
  const q = a / b;
  return Number.isFinite(q) ? q : null;
};

export const analyticsService = {
  async getDashboardKpis(): Promise<DashboardKpis> {
    const [vehicles, inShopCount, draftTrips] = await Promise.all([
      prisma.vehicle.findMany({ where: { status: { not: 'Retired' } }, select: { id: true, status: true } }),
      prisma.vehicle.count({ where: { status: 'InShop' } }),
      prisma.trip.aggregate({
        where: { status: 'Draft' },
        _sum: { cargoWeight: true },
      }),
    ]);

    const total = vehicles.length;
    const active = vehicles.filter((v) => v.status === 'OnTrip' || v.status === 'Available').length;
    const utilizationRate = total === 0 ? 0 : Math.round((active / total) * 100);
    const pendingCargo = draftTrips._sum.cargoWeight ?? 0;

    return {
      activeFleet: active,
      maintenanceAlerts: inShopCount,
      utilizationRate,
      pendingCargo,
    };
  },

  async getVehicleAnalytics(): Promise<VehicleAnalytics[]> {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: { not: 'Retired' } },
      include: {
        trips: { where: { status: 'Completed' }, select: { revenue: true, startOdometer: true, endOdometer: true } },
        maintenanceLogs: { select: { cost: true } },
        fuelLogs: { select: { liters: true, cost: true } },
      },
    });

    const fuelByVehicle = await prisma.trip.groupBy({
      by: ['vehicleId'],
      where: { status: 'Completed' },
      _sum: { endOdometer: true },
      _min: { startOdometer: true },
    });
    const tripDistanceMap = new Map<string, { start: number; end: number }>();
    fuelByVehicle.forEach((r) => {
      const start = r._min.startOdometer ?? 0;
      const end = r._sum.endOdometer ?? 0;
      tripDistanceMap.set(r.vehicleId, { start, end });
    });

    return vehicles.map((v) => {
      const totalFuelCost = v.fuelLogs.reduce((s, f) => s + f.cost, 0);
      const totalMaintenanceCost = v.maintenanceLogs.reduce((s, m) => s + m.cost, 0);
      const totalOperationalCost = totalFuelCost + totalMaintenanceCost;
      const totalRevenue = v.trips.reduce((s, t) => s + (t.revenue ?? 0), 0);
      const totalLiters = v.fuelLogs.reduce((s, f) => s + f.liters, 0);
      const dist = tripDistanceMap.get(v.id);
      const totalDistance = dist ? Math.max(0, dist.end - dist.start) : 0;
      const fuelEfficiency = totalLiters > 0 ? safeDiv(totalDistance, totalLiters) : null;
      const acq = v.acquisitionCost ?? 0;
      const roi = acq > 0 ? safeDiv(totalRevenue - totalOperationalCost, acq) : null;

      return {
        vehicleId: v.id,
        vehicleName: v.name,
        licensePlate: v.licensePlate,
        fuelEfficiency: fuelEfficiency ?? null,
        totalOperationalCost,
        acquisitionCost: v.acquisitionCost,
        totalRevenue,
        roi: roi ?? null,
      };
    });
  },

  async getMonthlySummaries(startDate?: Date, endDate?: Date): Promise<MonthlySeriesItem[]> {
    const start = startDate ?? new Date(new Date().getFullYear() - 1, 0, 1);
    const end = endDate ?? new Date();

    const trips = await prisma.trip.findMany({
      where: {
        status: 'Completed',
        createdAt: { gte: start, lte: end },
      },
      select: {
        revenue: true,
        cargoWeight: true,
        createdAt: true,
      },
    });

    const fuelLogs = await prisma.fuelLog.findMany({
      where: { date: { gte: start, lte: end } },
      select: { cost: true, date: true },
    });

    const maintenanceLogs = await prisma.maintenanceLog.findMany({
      where: { date: { gte: start, lte: end } },
      select: { cost: true, date: true },
    });

    const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const map = new Map<string, MonthlySeriesItem>();

    const ensureMonth = (key: string) => {
      if (!map.has(key)) map.set(key, { month: key, revenue: 0, fuelCost: 0, maintenanceCost: 0, tripsCount: 0, totalCargo: 0 });
      return map.get(key)!;
    };

    trips.forEach((t) => {
      const key = monthKey(t.createdAt);
      const row = ensureMonth(key);
      row.revenue += t.revenue ?? 0;
      row.tripsCount += 1;
      row.totalCargo += t.cargoWeight;
    });
    fuelLogs.forEach((f) => {
      const key = monthKey(f.date);
      const row = ensureMonth(key);
      row.fuelCost += f.cost;
    });
    maintenanceLogs.forEach((m) => {
      const key = monthKey(m.date);
      const row = ensureMonth(key);
      row.maintenanceCost += m.cost;
    });

    const sorted = Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
    return sorted;
  },

  async getUtilizationSeries(startDate?: Date, endDate?: Date): Promise<UtilizationSeriesItem[]> {
    const start = startDate ?? new Date(new Date().getFullYear() - 1, 0, 1);
    const end = endDate ?? new Date();

    const trips = await prisma.trip.findMany({
      where: {
        status: { in: ['Dispatched', 'Completed'] },
        createdAt: { gte: start, lte: end },
      },
      select: { vehicleId: true, createdAt: true, status: true },
    });

    const vehicleCountByMonth = await prisma.vehicle.groupBy({
      by: ['id'],
      where: { status: { not: 'Retired' } },
    });
    const totalVehicles = vehicleCountByMonth.length;

    const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const activeByMonth = new Map<string, Set<string>>();

    trips.forEach((t) => {
      const key = monthKey(t.createdAt);
      if (!activeByMonth.has(key)) activeByMonth.set(key, new Set());
      activeByMonth.get(key)!.add(t.vehicleId);
    });

    const sortedMonths = Array.from(activeByMonth.keys()).sort();
    return sortedMonths.map((month) => {
      const active = activeByMonth.get(month)!.size;
      const utilizationRate = totalVehicles === 0 ? 0 : Math.round((active / totalVehicles) * 100);
      return { month, utilizationRate, activeVehicles: active, totalVehicles };
    });
  },

  async getFuelEfficiencyByVehicle(): Promise<FuelEfficiencySeriesItem[]> {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: { not: 'Retired' } },
      include: {
        fuelLogs: { select: { liters: true } },
        trips: { where: { status: 'Completed' }, select: { startOdometer: true, endOdometer: true } },
      },
    });

    return vehicles.map((v) => {
      const totalLiters = v.fuelLogs.reduce((s, f) => s + f.liters, 0);
      let totalDistance = 0;
      v.trips.forEach((t) => {
        const start = t.startOdometer ?? 0;
        const end = t.endOdometer ?? 0;
        totalDistance += Math.max(0, end - start);
      });
      const fuelEfficiency = totalLiters > 0 ? safeDiv(totalDistance, totalLiters) : null;
      return {
        vehicleId: v.id,
        vehicleName: v.name,
        licensePlate: v.licensePlate,
        fuelEfficiency: fuelEfficiency ?? null,
        totalLiters,
        totalDistance,
      };
    });
  },
};
