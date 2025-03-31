import { z } from 'zod';

export const idSchema = z.string().uuid({ message: 'Invalid id' });

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

export const responseStatusSchema = z.enum(['success', 'error']);
export const sortOrderSchema = z.enum(['asc', 'desc']).default('asc');

export type ResponseStatus = z.infer<typeof responseStatusSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;

export type IsoDateString = z.infer<typeof isoDateStringShema>;

export type PagingMetadata = {
  nextCursor?: string;
  offset?: number;
  page?: number;
  limit: number;
  total?: number;
};

export type SortOptions<TSortField> = {
  field: TSortField;
  order: SortOrder;
};

export type PagingOptions = {
  cursor?: string;
  limit: number;
};

export type GetListOptions<TFilter, TSort> = {
  filter?: TFilter;
  sort?: TSort;
  paging?: PagingOptions;
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
  status: ResponseStatus;
  message?: string;
  data?: T;
  filters?: Record<string, unknown>;
  pagination?: PagingMetadata;
  timestamp?: number;
};
