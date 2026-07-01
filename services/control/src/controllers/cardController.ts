import { Request, Response } from 'express';
import { createCardSchema, updateCardSchema } from '@iot-access/card';
import { z } from 'zod';
import { cardService } from '../services/cardService';

const startEnrollmentSchema = z.object({
  ownerName: z.string().min(1),
});

const completeEnrollmentSchema = z.object({
  uid: z.string().min(1),
});

export const cardController = {
  async getAll(_req: Request, res: Response) {
    const cards = await cardService.getAll();
    res.json(cards);
  },

  async getActive(_req: Request, res: Response) {
    const cards = await cardService.getActive();
    res.json(cards);
  },

  async getByUid(req: Request<{ uid: string }>, res: Response) {
    const card = await cardService.getByUid(req.params.uid);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
  },

  async create(req: Request, res: Response) {
    const parsed = createCardSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    try {
      const card = await cardService.register(parsed.data.uid, parsed.data.ownerName);
      res.status(201).json(card);
    } catch (err: any) {
      res.status(409).json({ error: err.message });
    }
  },

  async startEnrollment(req: Request, res: Response) {
    const parsed = startEnrollmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const enrollment = await cardService.startEnrollment(parsed.data.ownerName);
    res.status(201).json(enrollment);
  },

  async getEnrollmentStatus(_req: Request, res: Response) {
    const enrollment = await cardService.getEnrollmentStatus();
    res.json(enrollment);
  },

  async completeEnrollment(req: Request, res: Response) {
    const parsed = completeEnrollmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const result = await cardService.completeEnrollment(parsed.data.uid);

    if (result.enrollment.status === 'success') {
      return res.status(201).json(result);
    }

    if (result.enrollment.status === 'already_registered') {
      return res.status(409).json(result);
    }

    return res.status(400).json(result);
  },

  async update(req: Request<{ uid: string }>, res: Response) {
    const parsed = updateCardSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    try {
      const card = await cardService.update(req.params.uid, parsed.data);
      res.json(card);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  },

  async remove(req: Request<{ uid: string }>, res: Response) {
    try {
      await cardService.remove(req.params.uid);
      res.status(204).send();
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  },
};
