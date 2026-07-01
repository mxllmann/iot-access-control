import { Router } from 'express';
import { accessController } from '../controllers/accessController';

const router = Router();

router.post('/', accessController.verify);

export default router;
