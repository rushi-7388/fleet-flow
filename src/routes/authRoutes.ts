import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { createUserSchema, loginSchema } from '../validations/user';

const router = Router();

router.post('/register', validate(createUserSchema.shape.body), register);
router.post('/login', validate(loginSchema.shape.body), login);

export default router;
