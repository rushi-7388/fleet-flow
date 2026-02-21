import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreateVehicleInput, UpdateVehicleInput } from '../validations/vehicle';
import { VehicleStatus, VehicleType } from '@prisma/client';

export const vehicleService = {
  async findAll(filters?: { status?: VehicleStatus; type?: VehicleType; region?: string }) {
    return prisma.vehicle.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.region && { region: filters.region }),
      },
      include: {
        _count: { select: { trips: true, maintenanceLogs: true, fuelLogs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        _count: { select: { trips: true, maintenanceLogs: true, fuelLogs: true } },
      },
    });
    if (!vehicle) throw new AppError(404, 'Vehicle not found');
    return vehicle;
  },

  async create(data: CreateVehicleInput) {
    const existing = await prisma.vehicle.findUnique({
      where: { licensePlate: data.licensePlate },
    });
    if (existing) throw new AppError(409, 'License plate already registered');
    return prisma.vehicle.create({
      data: {
        name: data.name,
        model: data.model,
        licensePlate: data.licensePlate,
        type: data.type as VehicleType,
        region: data.region,
        maxCapacity: data.maxCapacity,
        odometer: data.odometer ?? 0,
        status: (data.status as VehicleStatus) ?? 'Available',
        acquisitionCost: data.acquisitionCost ?? undefined,
      },
    });
  },

  async update(id: string, data: UpdateVehicleInput) {
    await this.findById(id);
    if (data.licensePlate) {
      const existing = await prisma.vehicle.findFirst({
        where: { licensePlate: data.licensePlate, NOT: { id } },
      });
      if (existing) throw new AppError(409, 'License plate already in use');
    }
    return prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        type: data.type as VehicleType | undefined,
        status: data.status as VehicleStatus | undefined,
      },
    });
  },

  async delete(id: string) {
    await this.findById(id);
    await prisma.vehicle.delete({ where: { id } });
    return { success: true };
  },
};
