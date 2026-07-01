import { z } from 'zod';

export const cardSchema = z.object({
  uid: z.string().min(1),
  ownerName: z.string().min(1),
  active: z.boolean().default(true),
});

export const createCardSchema = cardSchema.omit({ active: true });
export const updateCardSchema = cardSchema.omit({ uid: true }).partial();

export type Card = z.infer<typeof cardSchema>;
export type CreateCard = z.infer<typeof createCardSchema>;
export type UpdateCard = z.infer<typeof updateCardSchema>;
