export interface Category {
  id: string;
  name: string;
}

export interface Author {
  id: string;
  name: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Publisher {
  id: string;
  name: string;
}

export interface Review {
  id: string;
  bookId: string;
  rating: number;
  comment: string | undefined;
  updatedAt: Date;
}

export interface DigitalItemData {
  bookId: string;
  format: ItemFormat;
  url: string;
  size: number;
}

export enum ItemFormat {
  PDF = 'pdf',
  EPUB = 'epub',
  MP3 = 'mp3',
}
