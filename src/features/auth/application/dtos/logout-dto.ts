import { z } from 'zod';
export const LogoutParamsSchema = z.object({
  refreshToken: z.string(),
  userAgent: z.string(),
  device: z.string(),
});
export interface LogoutParamsDTO extends z.infer<typeof LogoutParamsSchema> {}
