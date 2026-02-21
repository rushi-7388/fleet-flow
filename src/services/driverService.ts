import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreateDriverInput, UpdateDriverInput } from '../validations/driver';
import { DriverStatus } from '@prisma/client';

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

export const driverService = {
  async findAll(filters?: { status?: DriverStatus }) {
    return prisma.driver.findMany({
      where: filters?.status ? { status: filters.status } : undefined,
      include: { _count: { select: { trips: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: { _count: { select: { trips: true } } },
    });
    if (!driver) throw new AppError(404, 'Driver not found');
    return driver;
  },

  async create(data: CreateDriverInput) {
    return prisma.driver.create({
      data: {
        name: data.name,
        licenseType: data.licenseType,
        licenseExpiry: toDate(data.licenseExpiry as string | Date),
        safetyScore: data.safetyScore ?? 100,
        status: (data.status as DriverStatus) ?? 'OffDuty',
      },
    });
  },

  async update(id: string, data: UpdateDriverInput) {
    await this.findById(id);
    return prisma.driver.update({
      where: { id },
      data: {
        ...data,
        licenseExpiry: data.licenseExpiry ? toDate(data.licenseExpiry as string | Date) : undefined,
        status: data.status as DriverStatus | undefined,
      },
    });
  },

  async delete(id: string) {
    await this.findById(id);
    await prisma.driver.delete({ where: { id } });
    return { success: true };
  },

  isLicenseExpired(licenseExpiry: Date): boolean {
    return new Date(licenseExpiry) < new Date();
  },
};
