import { z } from 'zod';

export const createFuelLogSchema = z.object({
  body: z.object({
    vehicleId: z.string().min(1, 'Vehicle is required'),
    liters: z.number().positive('Liters must be positive'),
    cost: z.number().min(0, 'Cost must be non-negative'),
    date: z.coerce.date(),
  }),
});

export const updateFuelLogSchema = z.object({
  body: z.object({
    liters: z.number().positive().optional(),
    cost: z.number().min(0).optional(),
    date: z.coerce.date().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const fuelLogIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export type CreateFuelLogInput = z.infer<typeof createFuelLogSchema>['body'];
export type UpdateFuelLogInput = z.infer<typeof updateFuelLogSchema>['body'];
