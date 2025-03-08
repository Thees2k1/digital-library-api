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

export type PagingMetadata = {
  nextCursor?: string;
  offset?: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
};

export type SortOptions = {
  field: string;
  order: 'asc' | 'desc';
};

export type PagingOptions = {
  cursor?: string;
  limit: number;
};

export type GetListOptions<T> = {
  filter: T;
  sort?: SortOptions;
  paging: PagingOptions;
};

export const apiResponseSchema = z.object({
  status: z.enum(['success', 'error']),
  message: z.string().optional(),
  data: z.unknown().optional(),
  filters: z.record(z.unknown()).optional(),
  pagination: z
    .object({
      nextCursor: z.number(),
      limit: z.number(),
      total: z.number(),
      hasNextPage: z.boolean(),
    })
    .optional(),
});

export type ApiResponse<T> = {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  filters?: Record<string, unknown>;
  pagination?: PagingMetadata;
  timestamp?: number;
};
