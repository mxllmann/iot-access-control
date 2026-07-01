import { Router } from 'express';
import * as logController from '../controllers/log.controller';

const router = Router();

router.get('/', logController.getAll);

export default router;
