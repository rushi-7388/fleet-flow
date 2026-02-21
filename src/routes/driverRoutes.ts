import { Router } from 'express';
import * as driverController from '../controllers/driverController';
import { authMiddleware } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  createDriverSchema,
  updateDriverSchema,
  driverIdParamSchema,
} from '../validations/driver';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

router.get('/', driverController.list);
router.get('/:id', validate(driverIdParamSchema.shape.params, 'params'), driverController.getOne);

// Fleet Manager & Admin only (Safety/Compliance). Dispatcher can only read (for trip assignment).
router.use(requireRoles(UserRole.ADMIN, UserRole.MANAGER));

router.post('/', validate(createDriverSchema.shape.body), driverController.create);
router.patch(
  '/:id',
  validate(driverIdParamSchema.shape.params, 'params'),
  validate(updateDriverSchema.shape.body),
  driverController.update
);
router.delete('/:id', validate(driverIdParamSchema.shape.params, 'params'), driverController.remove);

export default router;
