import z from 'zod';
export const SessionDtoSchema = z.object({
  sessionIdentity: z.string(),
  userId: z.string(),
  expiration: z.number(),
  ipAddress: z.string(),
  userAgent: z.string(),
  device: z.string(),
  location: z.string().optional(),
});

export interface SessionDTO extends z.infer<typeof SessionDtoSchema> {}
