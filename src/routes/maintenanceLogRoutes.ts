import { Router } from 'express';
import * as maintenanceLogController from '../controllers/maintenanceLogController';
import { authMiddleware } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  createMaintenanceLogSchema,
  updateMaintenanceLogSchema,
  maintenanceLogIdParamSchema,
} from '../validations/maintenanceLog';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

router.get('/', maintenanceLogController.list);
router.get(
  '/:id',
  validate(maintenanceLogIdParamSchema.shape.params, 'params'),
  maintenanceLogController.getOne
);

// Fleet Manager & Admin only: service logs (vehicle → In Shop).
router.use(requireRoles(UserRole.ADMIN, UserRole.MANAGER));

router.post('/', validate(createMaintenanceLogSchema.shape.body), maintenanceLogController.create);
router.patch(
  '/:id',
  validate(maintenanceLogIdParamSchema.shape.params, 'params'),
  validate(updateMaintenanceLogSchema.shape.body),
  maintenanceLogController.update
);
router.delete(
  '/:id',
  validate(maintenanceLogIdParamSchema.shape.params, 'params'),
  maintenanceLogController.remove
);

export default router;
