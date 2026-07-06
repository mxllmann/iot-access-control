import { Request, Response } from 'express';
import {
  createCredentialSchema,
  updateCredentialSchema,
} from '@iot-access/credential';
import { z } from 'zod';
import { credentialService } from '../services/credentialService';

const startEnrollmentSchema = z.object({
  ownerName: z.string().min(1),
  userId: z.string().optional(),
});

const completeEnrollmentSchema = z.object({
  uid: z.string().min(1),
});

export const credentialController = {
  async getAll(req: Request, res: Response) {
    if (req.user?.role === 'admin') {
      const credentials = await credentialService.getAll();
      return res.json(credentials);
    }
    const credentials = await credentialService.getByUserId(req.user!.userId);
    res.json(credentials);
  },

  async getActive(_req: Request, res: Response) {
    const credentials = await credentialService.getActive();
    res.json(credentials);
  },

  async getByUid(req: Request<{ uid: string }>, res: Response) {
    const credential = await credentialService.getByUid(req.params.uid);
    if (!credential) return res.status(404).json({ error: 'Credential not found' });

    if (req.user?.role !== 'admin' && credential.userId !== req.user?.userId) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    res.json(credential);
  },

  async create(req: Request, res: Response) {
    const parsed = createCredentialSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    try {
      const credential = await credentialService.register(
        parsed.data.uid,
        parsed.data.ownerName,
        parsed.data.userId
      );
      res.status(201).json(credential);
    } catch (err: any) {
      res.status(409).json({ error: err.message });
    }
  },

  async startEnrollment(req: Request, res: Response) {
    const parsed = startEnrollmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const enrollment = await credentialService.startEnrollment(
      parsed.data.ownerName,
      parsed.data.userId
    );
    res.status(201).json(enrollment);
  },

  async getEnrollmentStatus(_req: Request, res: Response) {
    const enrollment = await credentialService.getEnrollmentStatus();
    res.json(enrollment);
  },

  async completeEnrollment(req: Request, res: Response) {
    const parsed = completeEnrollmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const result = await credentialService.completeEnrollment(parsed.data.uid);

    if (result.enrollment.status === 'success') {
      return res.status(201).json(result);
    }

    if (result.enrollment.status === 'already_registered') {
      return res.status(409).json(result);
    }

    return res.status(400).json(result);
  },

  async update(req: Request<{ uid: string }>, res: Response) {
    const parsed = updateCredentialSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    try {
      const credential = await credentialService.update(req.params.uid, parsed.data);
      res.json(credential);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  },

  async remove(req: Request<{ uid: string }>, res: Response) {
    try {
      await credentialService.remove(req.params.uid);
      res.status(204).send();
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  },
};
