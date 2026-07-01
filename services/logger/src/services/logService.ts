import { AccessLogModel, AccessEvent } from '@iot-access/access-log';

export const logService = {
  async logAccess(event: AccessEvent) {
    return AccessLogModel.create({
      credentialUid: event.credentialUid,
      ownerName: event.ownerName,
      authorized: event.authorized,
      timestamp: new Date(event.timestamp),
    });
  },

  async getAll(filters?: {
    credentialUid?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const query: Record<string, any> = {};

    if (filters?.credentialUid) query.credentialUid = filters.credentialUid;

    if (filters?.startDate || filters?.endDate) {
      query.timestamp = {};
      if (filters?.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters?.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    return AccessLogModel.find(query)
      .sort({ timestamp: -1 })
      .limit(filters?.limit || 100);
  },
};
