import { Request, Response } from 'express';
import { updateConfigSchema } from '@iot-access/config';
import * as configService from '../services/config.service';

export async function getAll(_req: Request, res: Response) {
  const configs = await configService.getAll();
  res.json(configs);
}

export async function getByKey(req: Request<{ key: string }>, res: Response) {
  const config = await configService.getByKey(req.params.key);
  if (!config) return res.status(404).json({ error: 'Config not found' });
  res.json(config);
}

export async function upsert(req: Request<{ key: string }>, res: Response) {
  const parsed = updateConfigSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const config = await configService.upsert(
    req.params.key,
    parsed.data.value,
    parsed.data.description
  );
  res.json(config);
}
