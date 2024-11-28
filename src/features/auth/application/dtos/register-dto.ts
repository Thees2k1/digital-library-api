import { z } from 'zod';
export const RegisterBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string().nullable(),
  role: z.string().optional(),
});

export const RegisterResultSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  createdAt: z.date(),
});

export interface RegisterBodyDTO extends z.infer<typeof RegisterBodySchema> {}
export interface RegisterResultDTO
  extends z.infer<typeof RegisterResultSchema> {}
