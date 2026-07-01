import { AccessLogModel, AccessEvent } from '@iot-access/access-log';

export async function logAccess(event: AccessEvent) {
  return AccessLogModel.create({
    cardUid: event.cardUid,
    ownerName: event.ownerName,
    authorized: event.authorized,
    timestamp: new Date(event.timestamp),
  });
}

export async function getAll(filters?: {
  cardUid?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  const query: Record<string, any> = {};

  if (filters?.cardUid) query.cardUid = filters.cardUid;

  if (filters?.startDate || filters?.endDate) {
    query.timestamp = {};
    if (filters?.startDate) query.timestamp.$gte = new Date(filters.startDate);
    if (filters?.endDate) query.timestamp.$lte = new Date(filters.endDate);
  }

  return AccessLogModel.find(query)
    .sort({ timestamp: -1 })
    .limit(filters?.limit || 100);
}
