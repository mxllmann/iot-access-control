import { z } from 'zod';

export const credentialSchema = z.object({
  uid: z.string().min(1),
  ownerName: z.string().min(1),
  userId: z.string().optional(),
  active: z.boolean().default(true),
});

export const createCredentialSchema = credentialSchema.omit({ active: true });
export const updateCredentialSchema = credentialSchema.omit({ uid: true }).partial();

export type Credential = z.infer<typeof credentialSchema>;
export type CreateCredential = z.infer<typeof createCredentialSchema>;
export type UpdateCredential = z.infer<typeof updateCredentialSchema>;
