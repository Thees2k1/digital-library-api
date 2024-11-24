import { z } from "zod";

export const LoginBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const LoginResultSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});

export type LoginBodyDTO = z.infer<typeof LoginBodySchema> &{
    ipAddress?: string;
    userAgent?: string;
};
export type LoginResultDTO = z.infer<typeof LoginResultSchema>;