import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import type { CreateTripInput, UpdateTripInput, CompleteTripInput } from '../validations/trip';
import { TripStatus, VehicleStatus, DriverStatus } from '@prisma/client';
import { driverService } from './driverService';

export const tripService = {
  async findAll(filters?: { status?: TripStatus; vehicleId?: string; driverId?: string }) {
    return prisma.trip.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.vehicleId && { vehicleId: filters.vehicleId }),
        ...(filters?.driverId && { driverId: filters.driverId }),
      },
      include: {
        vehicle: { select: { id: true, name: true, licensePlate: true, type: true } },
        driver: { select: { id: true, name: true, licenseType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
      },
    });
    if (!trip) throw new AppError(404, 'Trip not found');
    return trip;
  },

  async create(data: CreateTripInput) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new AppError(404, 'Vehicle not found');
    if (vehicle.status !== 'Available') {
      throw new AppError(400, `Vehicle is not available (status: ${vehicle.status})`);
    }
    if (data.cargoWeight > vehicle.maxCapacity) {
      throw new AppError(400, `Cargo weight (${data.cargoWeight}) exceeds vehicle max capacity (${vehicle.maxCapacity})`);
    }

    const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
    if (!driver) throw new AppError(404, 'Driver not found');
    if (driver.status !== 'OnDuty') {
      throw new AppError(400, `Driver is not on duty (status: ${driver.status})`);
    }
    if (driverService.isLicenseExpired(driver.licenseExpiry)) {
      throw new AppError(400, 'Driver license has expired');
    }

    return prisma.trip.create({
      data: {
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        cargoWeight: data.cargoWeight,
        origin: data.origin,
        destination: data.destination,
        startOdometer: data.startOdometer ?? vehicle.odometer,
        endOdometer: data.endOdometer,
        revenue: data.revenue,
        status: (data.status as TripStatus) ?? 'Draft',
      },
      include: {
        vehicle: { select: { id: true, name: true, licensePlate: true } },
        driver: { select: { id: true, name: true } },
      },
    });
  },

  async update(id: string, data: UpdateTripInput) {
    const trip = await this.findById(id);
    if (trip.status !== 'Draft') {
      throw new AppError(400, 'Only draft trips can be updated');
    }
    if (data.cargoWeight != null && trip.vehicle) {
      if (data.cargoWeight > trip.vehicle.maxCapacity) {
        throw new AppError(400, `Cargo weight exceeds vehicle max capacity (${trip.vehicle.maxCapacity})`);
      }
    }
    return prisma.trip.update({
      where: { id },
      data: {
        ...data,
        status: data.status as TripStatus | undefined,
      },
      include: {
        vehicle: { select: { id: true, name: true, licensePlate: true } },
        driver: { select: { id: true, name: true } },
      },
    });
  },

  async dispatch(id: string) {
    const trip = await this.findById(id);
    if (trip.status !== 'Draft') {
      throw new AppError(400, 'Only draft trips can be dispatched');
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: trip.vehicleId } });
    if (!vehicle || vehicle.status !== 'Available') {
      throw new AppError(400, 'Vehicle is not available');
    }
    if (trip.cargoWeight > vehicle.maxCapacity) {
      throw new AppError(400, 'Cargo weight exceeds vehicle max capacity');
    }

    const driver = await prisma.driver.findUnique({ where: { id: trip.driverId } });
    if (!driver || driver.status !== 'OnDuty') {
      throw new AppError(400, 'Driver is not on duty');
    }
    if (driverService.isLicenseExpired(driver.licenseExpiry)) {
      throw new AppError(400, 'Driver license has expired');
    }

    await prisma.$transaction([
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'OnTrip' },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: 'OnTrip' },
      }),
      prisma.trip.update({
        where: { id },
        data: {
          status: 'Dispatched',
          startOdometer: trip.startOdometer ?? vehicle.odometer,
        },
      }),
    ]);

    return this.findById(id);
  },

  async complete(id: string, data: CompleteTripInput) {
    const trip = await this.findById(id);
    if (trip.status !== 'Dispatched') {
      throw new AppError(400, 'Only dispatched trips can be completed');
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: trip.vehicleId } });
    if (!vehicle) throw new AppError(404, 'Vehicle not found');

    await prisma.$transaction([
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'Available', odometer: data.endOdometer },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: 'OnDuty' },
      }),
      prisma.trip.update({
        where: { id },
        data: {
          status: 'Completed',
          endOdometer: data.endOdometer,
          revenue: data.revenue ?? trip.revenue ?? undefined,
        },
      }),
    ]);

    return this.findById(id);
  },

  async cancel(id: string) {
    const trip = await this.findById(id);
    if (trip.status === 'Completed' || trip.status === 'Cancelled') {
      throw new AppError(400, 'Trip is already completed or cancelled');
    }

    if (trip.status === 'Dispatched') {
      await prisma.$transaction([
        prisma.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: 'Available' },
        }),
        prisma.driver.update({
          where: { id: trip.driverId },
          data: { status: 'OnDuty' },
        }),
        prisma.trip.update({
          where: { id },
          data: { status: 'Cancelled' },
        }),
      ]);
    } else {
      await prisma.trip.update({
        where: { id },
        data: { status: 'Cancelled' },
      });
    }

    return this.findById(id);
  },

  async delete(id: string) {
    const trip = await this.findById(id);
    if (trip.status === 'Dispatched') {
      throw new AppError(400, 'Cannot delete a dispatched trip. Cancel it first.');
    }
    await prisma.trip.delete({ where: { id } });
    return { success: true };
  },
};
