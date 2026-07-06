import { Router } from 'express';
import { configController } from '../controllers/configController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', configController.getAll);
router.get('/:key', configController.getByKey);
router.put('/:key', configController.upsert);

export default router;
