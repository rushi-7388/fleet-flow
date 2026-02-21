import { z } from 'zod';

const driverStatusEnum = z.enum(['OnDuty', 'OffDuty', 'Suspended', 'OnTrip']);

export const createDriverSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    licenseType: z.string().min(1, 'License type is required'),
    licenseExpiry: z.coerce.date(),
    safetyScore: z.number().min(0).max(100).default(100),
    status: driverStatusEnum.default('OffDuty'),
  }),
});

export const updateDriverSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    licenseType: z.string().min(1).optional(),
    licenseExpiry: z.coerce.date().optional(),
    safetyScore: z.number().min(0).max(100).optional(),
    status: driverStatusEnum.optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const driverIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>['body'];
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>['body'];
