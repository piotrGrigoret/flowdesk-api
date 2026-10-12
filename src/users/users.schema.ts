import { z } from 'zod';
export const userRoleSchema = z.enum(['user', 'admin']);

export const userResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  role: userRoleSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;