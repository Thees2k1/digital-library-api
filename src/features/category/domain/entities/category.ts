export class CategoryEntity {
  id: string;
  name: string;
  cover: string;
  description: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  books: Book[] = [];

  constructor(
    id: string,
    name: string,
    cover: string,
    description: string,
    createdAt: Date | undefined,
    updatedAt: Date | undefined,
    books: Book[] = [],
  ) {
    this.id = id;
    this.name = name;
    this.cover = cover;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.books = books;
  }
}

interface Book {
  id: string;
  title: string;

  reviews: Review[];
  likes?: number;
  readCount?: number;
}

interface Review {
  review: string;
  rating: number;
}
