export class SerieEntity {
  id: string;
  name: string;
  cover: string;
  description: string;
  books: string[];
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
    books: string[] | undefined,
    releaseDate: Date | undefined,
    createdAt: Date | undefined,
    updatedAt: Date | undefined,
  ) {
    this.id = id;
    this.name = name;
    this.cover = cover;
    this.status = status;
    this.books = books ?? [];
    this.releaseDate = releaseDate;
    this.description = description;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }
}

type SerieStatus = 'completed' | 'ongoing' | 'archived' | 'planned' | 'deleted';
