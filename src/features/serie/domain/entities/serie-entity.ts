export class SerieEntity {
  id: string;
  name: string;
  cover: string;
  description: string;
  author: Author | undefined;
  books: Book[];
  status: SerieStatus;
  releaseDate: Date | undefined;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    cover: string,
    description: string,
    status: SerieStatus,
    author: Author | undefined,
    books: Book[],
    releaseDate: Date | undefined,
    createdAt: Date | undefined,
    updatedAt: Date | undefined,
  ) {
    this.id = id;
    this.name = name;
    this.cover = cover;
    this.status = status;
    this.books = books ?? [];
    this.author = author;
    this.releaseDate = releaseDate;
    this.description = description;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }
}

interface Book {
  id: string;
  title: string;
  cover: string;
  popularityPoints: number;
}

interface Author {
  id: string;
  name: string;
  avatar: string;
}

type SerieStatus = 'completed' | 'ongoing' | 'archived' | 'planned' | 'deleted';
