import { z } from 'zod';

export const configValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.unknown()),
  z.record(z.unknown()),
]);

export const configSchema = z.object({
  key: z.string().min(1),
  value: configValueSchema,
  description: z.string().optional(),
});

export const updateConfigSchema = configSchema.omit({ key: true });

export type ConfigValue =
  | string
  | number
  | boolean
  | null
  | unknown[]
  | Record<string, unknown>;

export type Config = {
  key: string;
  value: ConfigValue;
  description?: string;
};

export type UpdateConfig = Omit<Config, 'key'>;
