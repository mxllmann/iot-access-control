import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.post('/create-user', authenticate, requireRole('admin'), authController.createUser);

export default router;
