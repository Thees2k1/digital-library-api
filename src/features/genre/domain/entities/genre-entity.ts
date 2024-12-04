export class GenreEntity {
  id: string;
  name: string;
  description: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;

  constructor(
    id: string,
    name: string,
    description: string,
    createdAt: Date | undefined,
    updatedAt: Date | undefined,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
