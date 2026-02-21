import { Router } from 'express';
import * as vehicleController from '../controllers/vehicleController';
import { authMiddleware } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleIdParamSchema,
} from '../validations/vehicle';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

router.get('/', vehicleController.list);
router.get('/:id', validate(vehicleIdParamSchema.shape.params, 'params'), vehicleController.getOne);

// Fleet Manager & Admin only: asset CRUD. Dispatcher can only read (for trip assignment).
router.use(requireRoles(UserRole.ADMIN, UserRole.MANAGER));

router.post('/', validate(createVehicleSchema.shape.body), vehicleController.create);
router.patch(
  '/:id',
  validate(vehicleIdParamSchema.shape.params, 'params'),
  validate(updateVehicleSchema.shape.body),
  vehicleController.update
);
router.delete('/:id', validate(vehicleIdParamSchema.shape.params, 'params'), vehicleController.remove);

export default router;
