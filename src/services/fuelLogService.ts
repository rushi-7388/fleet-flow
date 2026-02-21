import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreateFuelLogInput, UpdateFuelLogInput } from '../validations/fuelLog';

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

export const fuelLogService = {
  async findAll(vehicleId?: string) {
    return prisma.fuelLog.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: { vehicle: { select: { id: true, name: true, licensePlate: true } } },
      orderBy: { date: 'desc' },
    });
  },

  async findById(id: string) {
    const log = await prisma.fuelLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!log) throw new AppError(404, 'Fuel log not found');
    return log;
  },

  async create(data: CreateFuelLogInput) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new AppError(404, 'Vehicle not found');

    return prisma.fuelLog.create({
      data: {
        vehicleId: data.vehicleId,
        liters: data.liters,
        cost: data.cost,
        date: toDate(data.date as string | Date),
      },
      include: { vehicle: { select: { id: true, name: true, licensePlate: true } } },
    });
  },

  async update(id: string, data: UpdateFuelLogInput) {
    await this.findById(id);
    return prisma.fuelLog.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? toDate(data.date as string | Date) : undefined,
      },
      include: { vehicle: { select: { id: true, name: true, licensePlate: true } } },
    });
  },

  async delete(id: string) {
    await this.findById(id);
    await prisma.fuelLog.delete({ where: { id } });
    return { success: true };
  },
};
