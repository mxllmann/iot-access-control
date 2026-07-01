import { z } from 'zod';

export const accessEventSchema = z.object({
  cardUid: z.string().min(1),
  ownerName: z.string().optional(),
  authorized: z.boolean(),
  timestamp: z.string().datetime(),
});

export type AccessEvent = z.infer<typeof accessEventSchema>;

export const ACCESS_EVENT_QUEUE = 'access_logs';
