import { z } from 'zod';

export const userRoles = ['admin', 'user'] as const;
export type UserRole = (typeof userRoles)[number];

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(userRoles).default('user'),
});

export const createUserSchema = userSchema.pick({ email: true, name: true, role: true });
export const updateUserSchema = userSchema.partial().omit({ email: true });
export const inviteUserSchema = userSchema.pick({ email: true, name: true, role: true });

export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type InviteUser = z.infer<typeof inviteUserSchema>;
