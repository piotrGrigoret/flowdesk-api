import { z } from 'zod';

export const userResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;