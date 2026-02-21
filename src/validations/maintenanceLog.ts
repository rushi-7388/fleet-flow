import { z } from 'zod';

export const createMaintenanceLogSchema = z.object({
  body: z.object({
    vehicleId: z.string().min(1, 'Vehicle is required'),
    serviceType: z.string().min(1, 'Service type is required').optional(),
    description: z.string().min(1, 'Description is required'),
    cost: z.number().min(0, 'Cost must be non-negative'),
    date: z.coerce.date(),
    nextServiceDue: z.coerce.date().optional().nullable(),
  }),
});

export const updateMaintenanceLogSchema = z.object({
  body: z.object({
    description: z.string().min(1).optional(),
    cost: z.number().min(0).optional(),
    date: z.coerce.date().optional(),
    serviceType: z.string().min(1).optional(),
    nextServiceDue: z.coerce.date().optional().nullable(),
    status: z.enum(['Pending', 'InProgress', 'Completed']).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const maintenanceLogIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export type CreateMaintenanceLogInput = z.infer<typeof createMaintenanceLogSchema>['body'];
export type UpdateMaintenanceLogInput = z.infer<typeof updateMaintenanceLogSchema>['body'];
