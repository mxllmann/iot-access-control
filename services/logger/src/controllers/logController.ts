import { Request, Response } from 'express';
import { logService } from '../services/logService';

export const logController = {
  async getAll(req: Request, res: Response) {
    const { cardUid, startDate, endDate, limit } = req.query;
    const logs = await logService.getAll({
      cardUid: cardUid as string,
      startDate: startDate as string,
      endDate: endDate as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    res.json(logs);
  },
};
