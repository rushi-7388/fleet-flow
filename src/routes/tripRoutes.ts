import { Router } from 'express';
import * as tripController from '../controllers/tripController';
import { authMiddleware } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  createTripSchema,
  updateTripSchema,
  dispatchTripSchema,
  completeTripSchema,
  cancelTripSchema,
  tripIdParamSchema,
} from '../validations/trip';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

router.get('/', tripController.list);
router.get('/:id', validate(tripIdParamSchema.shape.params, 'params'), tripController.getOne);

// Dispatcher & Admin only: create/dispatch/complete/cancel. Fleet Manager can only read (scheduling oversight).
router.use(requireRoles(UserRole.ADMIN, UserRole.DISPATCHER));

router.post('/', validate(createTripSchema.shape.body), tripController.create);
router.patch(
  '/:id',
  validate(tripIdParamSchema.shape.params, 'params'),
  validate(updateTripSchema.shape.body),
  tripController.update
);
router.delete('/:id', validate(tripIdParamSchema.shape.params, 'params'), tripController.remove);

router.post(
  '/:id/dispatch',
  validate(dispatchTripSchema.shape.params, 'params'),
  tripController.dispatch
);
router.post(
  '/:id/complete',
  validate(completeTripSchema.shape.params, 'params'),
  validate(completeTripSchema.shape.body),
  tripController.complete
);
router.post('/:id/cancel', validate(cancelTripSchema.shape.params, 'params'), tripController.cancel);

export default router;
