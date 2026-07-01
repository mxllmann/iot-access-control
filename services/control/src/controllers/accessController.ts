import { Request, Response } from 'express';
import { z } from 'zod';
import { accessService } from '../services/accessService';

const verifyAccessSchema = z.object({
  credentialUid: z.string().min(1),
});

export const accessController = {
  async verify(req: Request, res: Response) {
    const parsed = verifyAccessSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }
    const result = await accessService.verifyAccess(parsed.data.credentialUid);
    res.json(result);
  },
};
