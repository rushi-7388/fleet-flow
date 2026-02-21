import { z } from 'zod';

export const createExpenseSchema = z.object({
  body: z.object({
    vehicleId: z.string().min(1, 'Vehicle is required'),
    tripId: z.string().optional().nullable(),
    expenseType: z.enum(['Fuel', 'Maintenance', 'Toll', 'Repair', 'Other']),
    amount: z.number().min(0, 'Amount must be non-negative'),
    date: z.coerce.date(),
    description: z.string().optional().nullable(),
  }),
});

export const updateExpenseSchema = z.object({
  body: z.object({
    tripId: z.string().optional().nullable(),
    expenseType: z.enum(['Fuel', 'Maintenance', 'Toll', 'Repair', 'Other']).optional(),
    amount: z.number().min(0).optional(),
    date: z.coerce.date().optional(),
    description: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const expenseIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>['body'];
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>['body'];
