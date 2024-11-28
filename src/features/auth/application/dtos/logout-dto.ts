import { z } from 'zod';
export const LogoutBodySchema = z.object({
  refreshToken: z.string(),
});

export type LogoutBodyDTO = z.infer<typeof LogoutBodySchema>;
