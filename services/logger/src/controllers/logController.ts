import { Request, Response } from 'express';
import { logService } from '../services/logService';

export const logController = {
  async getAll(req: Request, res: Response) {
    const { credentialUid, startDate, endDate, limit } = req.query;
    const logs = await logService.getAll({
      credentialUid: credentialUid as string,
      startDate: startDate as string,
      endDate: endDate as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    res.json(logs);
  },
};
