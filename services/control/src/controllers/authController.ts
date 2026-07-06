import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';
import { UserModel } from '@iot-access/user';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(['admin', 'user']).default('user'),
});

export const authController = {
  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten().fieldErrors });

    try {
      const result = await authService.login(parsed.data.email, parsed.data.password);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  },

  async createUser(req: Request, res: Response) {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten().fieldErrors });

    try {
      const user = await authService.createUser(
        parsed.data.email,
        parsed.data.name,
        parsed.data.password,
        parsed.data.role
      );
      res.status(201).json(user);
    } catch (err: any) {
      res.status(409).json({ error: err.message });
    }
  },

  async me(req: Request, res: Response) {
    const user = await UserModel.findById(req.user!.userId).select(
      '-passwordHash -inviteToken -inviteTokenExpires'
    );
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  },
};
