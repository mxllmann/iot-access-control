import { Router } from 'express';
import { credentialController } from '../controllers/credentialController';

const router = Router();

router.get('/', credentialController.getAll);
router.get('/active', credentialController.getActive);
router.post('/enrollment', credentialController.startEnrollment);
router.get('/enrollment', credentialController.getEnrollmentStatus);
router.post('/enrollment/read', credentialController.completeEnrollment);
router.get('/:uid', credentialController.getByUid);
router.post('/', credentialController.create);
router.put('/:uid', credentialController.update);
router.delete('/:uid', credentialController.remove);

export default router;
