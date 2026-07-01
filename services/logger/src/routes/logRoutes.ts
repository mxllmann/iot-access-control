import { Router } from 'express';
import { logController } from '../controllers/logController';

const router = Router();

router.get('/', logController.getAll);

export default router;
