import { Request, Response, NextFunction } from 'express';
import { authService, JwtPayload } from '../services/authService';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    req.user = authService.verifyToken(header.slice(7));
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    next();
  };
}

const DEVICE_API_KEY = process.env.DEVICE_API_KEY || 'iot-device-key';

export function authenticateDevice(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== DEVICE_API_KEY) {
    return res.status(401).json({ error: 'API key inválida' });
  }
  next();
}
