import { Router } from 'express';
import * as fuelLogController from '../controllers/fuelLogController';
import { authMiddleware } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  createFuelLogSchema,
  updateFuelLogSchema,
  fuelLogIdParamSchema,
} from '../validations/fuelLog';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

router.get('/', fuelLogController.list);
router.get(
  '/:id',
  validate(fuelLogIdParamSchema.shape.params, 'params'),
  fuelLogController.getOne
);

router.use(requireRoles(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER));

router.post('/', validate(createFuelLogSchema.shape.body), fuelLogController.create);
router.patch(
  '/:id',
  validate(fuelLogIdParamSchema.shape.params, 'params'),
  validate(updateFuelLogSchema.shape.body),
  fuelLogController.update
);
router.delete(
  '/:id',
  validate(fuelLogIdParamSchema.shape.params, 'params'),
  fuelLogController.remove
);

export default router;
