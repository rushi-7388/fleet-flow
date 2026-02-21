import { z } from 'zod';

export const reportQuerySchema = z.object({
  startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
});
