import { Router } from 'express';
import * as expenseController from '../controllers/expenseController';
import { authMiddleware } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseIdParamSchema,
} from '../validations/expense';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authMiddleware);

router.get('/', expenseController.list);
router.get('/:id', validate(expenseIdParamSchema.shape.params, 'params'), expenseController.getOne);

router.use(requireRoles(UserRole.ADMIN, UserRole.MANAGER));

router.post('/', validate(createExpenseSchema.shape.body), expenseController.create);
router.patch(
  '/:id',
  validate(expenseIdParamSchema.shape.params, 'params'),
  validate(updateExpenseSchema.shape.body),
  expenseController.update
);
router.delete('/:id', validate(expenseIdParamSchema.shape.params, 'params'), expenseController.remove);

export default router;
