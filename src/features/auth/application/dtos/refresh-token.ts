import { z } from 'zod';

export const RefreshTokenResultSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export interface RefreshResultDTO
  extends z.infer<typeof RefreshTokenResultSchema> {}

export const RefreshTokenParamsSchema = z.object({
  refreshToken: z.string(),
  userAgent: z.string(),
  device: z.string(),
  ipAddress: z.string(),
  location: z.string().default(''),
});

export interface RefreshTokenParamsDTO
  extends z.infer<typeof RefreshTokenParamsSchema> {}
