import { z } from 'zod';

const userRoleEnum = z.enum(['ADMIN', 'MANAGER', 'DISPATCHER', 'VIEWER']);

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: userRoleEnum,
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: userRoleEnum.optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
