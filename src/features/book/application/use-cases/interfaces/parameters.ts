import { PagingMetadata } from '@src/core/types';

export type BooksFilter = {
  query?: string;
  genres?: string[];
  authorId?: string;
  categoryId?: string;
  publisherId?: string;
  releaseDateRange?: {
    from: number;
    to: number;
  };
};

export type SortOptions = {
  field: string;
  order: 'asc' | 'desc';
};

export type PagingOptions = {
  cursor?: string;
  limit: number;
};

export type GetListOptions = {
  filter: BooksFilter;
  sort?: SortOptions;
  paging: PagingOptions;
};
