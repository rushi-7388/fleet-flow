import { z } from 'zod';

const tripStatusEnum = z.enum(['Draft', 'Dispatched', 'Completed', 'Cancelled']);

export const createTripSchema = z.object({
  body: z.object({
    vehicleId: z.string().min(1, 'Vehicle is required'),
    driverId: z.string().min(1, 'Driver is required'),
    cargoWeight: z.number().positive('Cargo weight must be positive'),
    origin: z.string().min(1, 'Origin is required'),
    destination: z.string().min(1, 'Destination is required'),
    startOdometer: z.number().min(0).optional(),
    endOdometer: z.number().min(0).optional(),
    revenue: z.number().min(0).optional(),
    status: tripStatusEnum.default('Draft'),
  }),
});

export const updateTripSchema = z.object({
  body: z.object({
    cargoWeight: z.number().positive().optional(),
    origin: z.string().min(1).optional(),
    destination: z.string().min(1).optional(),
    startOdometer: z.number().min(0).optional(),
    endOdometer: z.number().min(0).optional(),
    revenue: z.number().min(0).optional(),
    status: tripStatusEnum.optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const dispatchTripSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const completeTripSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    endOdometer: z.number().min(0),
    revenue: z.number().min(0).optional(),
  }),
});

export const cancelTripSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const tripIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export type CreateTripInput = z.infer<typeof createTripSchema>['body'];
export type UpdateTripInput = z.infer<typeof updateTripSchema>['body'];
export type CompleteTripInput = z.infer<typeof completeTripSchema>['body'];
