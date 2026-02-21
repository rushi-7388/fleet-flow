import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreateExpenseInput, UpdateExpenseInput } from '../validations/expense';

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value;
}

export const expenseService = {
  async findAll(vehicleId?: string, tripId?: string) {
    const where: { vehicleId?: string; tripId?: string | null } = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (tripId) where.tripId = tripId;

    return prisma.expense.findMany({
      where: Object.keys(where).length ? where : undefined,
      include: {
        vehicle: { select: { id: true, name: true, licensePlate: true } },
        trip: { select: { id: true, origin: true, destination: true } },
      },
      orderBy: { date: 'desc' },
    });
  },

  async findById(id: string) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { vehicle: true, trip: true },
    });
    if (!expense) throw new AppError(404, 'Expense not found');
    return expense;
  },

  async create(data: CreateExpenseInput) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new AppError(404, 'Vehicle not found');
    if (data.tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: data.tripId } });
      if (!trip) throw new AppError(404, 'Trip not found');
    }

    return prisma.expense.create({
      data: {
        vehicleId: data.vehicleId,
        tripId: data.tripId ?? null,
        expenseType: data.expenseType as 'Fuel' | 'Maintenance' | 'Toll' | 'Repair' | 'Other',
        amount: data.amount,
        date: toDate(data.date as string | Date),
        description: data.description ?? null,
      },
      include: {
        vehicle: { select: { id: true, name: true, licensePlate: true } },
        trip: { select: { id: true, origin: true, destination: true } },
      },
    });
  },

  async update(id: string, data: UpdateExpenseInput) {
    await this.findById(id);
    return prisma.expense.update({
      where: { id },
      data: {
        ...data,
        tripId: data.tripId === undefined ? undefined : data.tripId ?? null,
        date: data.date ? toDate(data.date as string | Date) : undefined,
        description: data.description === undefined ? undefined : data.description ?? null,
      },
      include: {
        vehicle: { select: { id: true, name: true, licensePlate: true } },
        trip: { select: { id: true, origin: true, destination: true } },
      },
    });
  },

  async delete(id: string) {
    await this.findById(id);
    await prisma.expense.delete({ where: { id } });
    return { success: true };
  },
};
