import { create } from "domain";
import { z } from "zod";
export const RegisterBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string().nullable(),
});

export const RegisterResultSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  createdAt: z.date(),
});

export type RegisterBodyDTO = z.infer<typeof RegisterBodySchema>;
export type RegisterResultDTO = z.infer<typeof RegisterResultSchema>;
