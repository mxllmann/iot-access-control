import { Request, Response } from 'express';
import { updateUserSchema } from '@iot-access/user';
import { userService } from '../services/userService';

export const userController = {
  async getAll(_req: Request, res: Response) {
    const users = await userService.getAll();
    res.json(users);
  },

  async getById(req: Request<{ id: string }>, res: Response) {
    const user = await userService.getById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  },

  async update(req: Request<{ id: string }>, res: Response) {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten().fieldErrors });

    try {
      const user = await userService.update(req.params.id, parsed.data);
      res.json(user);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  },

  async remove(req: Request<{ id: string }>, res: Response) {
    try {
      await userService.remove(req.params.id);
      res.status(204).send();
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  },
};
