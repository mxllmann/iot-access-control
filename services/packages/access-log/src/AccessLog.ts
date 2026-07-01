import { z } from 'zod';

export const accessLogSchema = z.object({
  credentialUid: z.string().min(1),
  ownerName: z.string().optional(),
  authorized: z.boolean(),
  timestamp: z.coerce.date(),
});

export type AccessLog = z.infer<typeof accessLogSchema>;
