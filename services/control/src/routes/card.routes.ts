import { Router } from 'express';
import * as cardController from '../controllers/card.controller';

const router = Router();

router.get('/', cardController.getAll);
router.get('/active', cardController.getActive);
router.get('/:uid', cardController.getByUid);
router.post('/', cardController.create);
router.put('/:uid', cardController.update);
router.delete('/:uid', cardController.remove);

export default router;
