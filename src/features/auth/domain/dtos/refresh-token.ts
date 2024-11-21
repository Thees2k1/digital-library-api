import { z } from 'zod';
export const RefreshTokenBodySchema = z.object({ 
    refreshToken: z.string(),
});

export const RefreshTokenResultSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});

export type RefreshBodyDTO = z.infer<typeof RefreshTokenBodySchema>;
export type RefreshResultDTO = z.infer<typeof RefreshTokenResultSchema>;