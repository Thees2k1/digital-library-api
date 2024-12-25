import { z } from 'zod';

export const idSchema = z.string().uuid();

export type Id = z.infer<typeof idSchema>;

export const isoDateStringShema = z.string().refine(
  (val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  {
    message: 'Invalid ISO date string',
  },
);

export type IsoDateString = z.infer<typeof isoDateStringShema>;
