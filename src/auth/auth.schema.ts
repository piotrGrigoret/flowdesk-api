import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100)
});

export type UserResponse = z.infer<typeof loginSchema>;