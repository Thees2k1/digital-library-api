import z from 'zod';

export const AuthSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sessionIdentity: z.string(),
  ipAddress: z.string(),
  userAgent: z.string(),
  device: z.string(),
  location: z.string().optional(),
  expiresAt: z.date(),
  createdAt: z.date(),
  active: z.boolean().default(true),
  isRevoked: z.boolean().default(false),
});

export interface AuthSession extends z.infer<typeof AuthSessionSchema> {}
