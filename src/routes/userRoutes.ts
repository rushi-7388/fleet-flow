import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from '../validations/user';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles(UserRole.ADMIN, UserRole.MANAGER));

router.get('/', userController.list);
router.get('/:id', validate(userIdParamSchema.shape.params, 'params'), userController.getOne);
router.post('/', requireRoles(UserRole.ADMIN), validate(createUserSchema.shape.body), userController.create);
router.patch(
  '/:id',
  validate(userIdParamSchema.shape.params, 'params'),
  validate(updateUserSchema.shape.body),
  userController.update
);
router.delete('/:id', validate(userIdParamSchema.shape.params, 'params'), userController.remove);

export default router;
