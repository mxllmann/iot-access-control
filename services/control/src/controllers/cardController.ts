import { Request, Response } from 'express';
import { createCardSchema, updateCardSchema } from '@iot-access/card';
import * as cardService from '../services/card.service';

export const cardController = {
  async getAll(_req: Request, res: Response) {
    const cards = await cardService.getAll();
    res.json(cards);
  },

  async getActive(_req: Request, res: Response) {
    const cards = await cardService.getActive();
    res.json(cards);
  },

  async getByUid(req: Request, res: Response) {
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

  async update(req: Request, res: Response) {
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

  async remove(req: Request, res: Response) {
    try {
      await cardService.remove(req.params.uid);
      res.status(204).send();
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  },
};
