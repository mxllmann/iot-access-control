import { Router } from 'express';
import { cardController } from '../controllers/cardController';

const router = Router();

router.get('/', cardController.getAll);
router.get('/active', cardController.getActive);
router.post('/enrollment', cardController.startEnrollment);
router.get('/enrollment', cardController.getEnrollmentStatus);
router.post('/enrollment/read', cardController.completeEnrollment);
router.get('/:uid', cardController.getByUid);
router.post('/', cardController.create);
router.put('/:uid', cardController.update);
router.delete('/:uid', cardController.remove);

export default router;
