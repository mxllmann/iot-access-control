import { Router } from 'express';
import { accessController } from '../controllers/accessController';
import { authenticateDevice } from '../middleware/auth';

const router = Router();

router.post('/', authenticateDevice, accessController.verify);

export default router;
