import { Router } from 'express';
import * as accessController from '../controllers/access.controller';

const router = Router();

router.post('/', accessController.verify);

export default router;
