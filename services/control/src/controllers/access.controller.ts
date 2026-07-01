import { Request, Response } from 'express';
import { z } from 'zod';
import * as accessService from '../services/access.service';

const verifyAccessSchema = z.object({
  cardUid: z.string().min(1),
});

export async function verify(req: Request, res: Response) {
  const parsed = verifyAccessSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const result = await accessService.verifyAccess(parsed.data.cardUid);
  res.json(result);
}
