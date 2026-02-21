import { z } from 'zod';

const vehicleTypeEnum = z.enum(['Truck', 'Van', 'Bike']);
const vehicleStatusEnum = z.enum(['Available', 'OnTrip', 'InShop', 'Retired']);

export const createVehicleSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    model: z.string().min(1, 'Model is required'),
    licensePlate: z.string().min(1, 'License plate is required'),
    type: vehicleTypeEnum,
    region: z.string().min(1, 'Region is required'),
    maxCapacity: z.number().positive('Max capacity must be positive'),
    odometer: z.number().min(0).default(0),
    status: vehicleStatusEnum.default('Available'),
    acquisitionCost: z.number().min(0).optional().nullable(),
  }),
});

export const updateVehicleSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    licensePlate: z.string().min(1).optional(),
    type: vehicleTypeEnum.optional(),
    region: z.string().min(1).optional(),
    maxCapacity: z.number().positive().optional(),
    odometer: z.number().min(0).optional(),
    status: vehicleStatusEnum.optional(),
    acquisitionCost: z.number().min(0).optional().nullable(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const vehicleIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>['body'];
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>['body'];
