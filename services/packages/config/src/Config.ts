import { z } from 'zod';

export const configValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const configSchema = z.object({
  key: z.string().min(1),
  value: configValueSchema,
  description: z.string().optional(),
});

export const updateConfigSchema = configSchema.omit({ key: true });

export type Config = z.infer<typeof configSchema>;
export type UpdateConfig = z.infer<typeof updateConfigSchema>;
