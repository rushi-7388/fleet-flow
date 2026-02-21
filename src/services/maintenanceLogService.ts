import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreateMaintenanceLogInput, UpdateMaintenanceLogInput } from '../validations/maintenanceLog';

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

export const maintenanceLogService = {
  async findAll(vehicleId?: string) {
    return prisma.maintenanceLog.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: { vehicle: { select: { id: true, name: true, licensePlate: true } } },
      orderBy: { date: 'desc' },
    });
  },

  async findById(id: string) {
    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!log) throw new AppError(404, 'Maintenance log not found');
    return log;
  },

  async create(data: CreateMaintenanceLogInput) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new AppError(404, 'Vehicle not found');

    const log = await prisma.maintenanceLog.create({
      data: {
        vehicleId: data.vehicleId,
        description: data.description,
        cost: data.cost,
        date: toDate(data.date as string | Date),
      },
      include: { vehicle: { select: { id: true, name: true, licensePlate: true } } },
    });

    await prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: 'InShop' },
    });

    return log;
  },

  async update(id: string, data: UpdateMaintenanceLogInput) {
    await this.findById(id);
    return prisma.maintenanceLog.update({
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
    await prisma.maintenanceLog.delete({ where: { id } });
    return { success: true };
  },
};
