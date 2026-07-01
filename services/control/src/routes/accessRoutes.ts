import { Router } from 'express';
import { accessController } from '../controllers/access.controller';

const router = Router();

router.post('/', accessController.verify);

export default router;
