import { Router } from 'express';
import { configController } from '../controllers/config.controller';

const router = Router();

router.get('/', configController.getAll);
router.get('/:key', configController.getByKey);
router.put('/:key', configController.upsert);

export default router;
