import { Router } from 'express';
import { credentialController } from '../controllers/credentialController';
import { authenticate, requireRole, authenticateDevice } from '../middleware/auth';

const router = Router();

// Device routes (API key auth)
router.get('/enrollment', authenticateDevice, credentialController.getEnrollmentStatus);
router.post('/enrollment/read', authenticateDevice, credentialController.completeEnrollment);

// App routes (JWT auth)
router.get('/', authenticate, credentialController.getAll);
router.get('/active', authenticate, credentialController.getActive);
router.post('/enrollment', authenticate, requireRole('admin'), credentialController.startEnrollment);
router.get('/:uid', authenticate, credentialController.getByUid);
router.post('/', authenticate, requireRole('admin'), credentialController.create);
router.put('/:uid', authenticate, requireRole('admin'), credentialController.update);
router.delete('/:uid', authenticate, requireRole('admin'), credentialController.remove);

export default router;
