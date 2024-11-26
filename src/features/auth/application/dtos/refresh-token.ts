import { z } from 'zod';
export const RefreshTokenBodySchema = z.object({ 
    refreshToken: z.string(),
});

export const RefreshTokenResultSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});

export interface RefreshBodyDTO extends z.infer<typeof RefreshTokenBodySchema>{};
export interface RefreshResultDTO extends z.infer<typeof RefreshTokenResultSchema>{};