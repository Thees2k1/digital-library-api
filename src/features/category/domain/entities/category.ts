export class CategoryEntity {
  id: string;
  name: string;
  cover: string | undefined;
  description: string | undefined;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;

  constructor(
    id: string,
    name: string,
    cover: string,
    description: string | undefined,
    createdAt: Date | undefined,
    updatedAt: Date | undefined,
  ) {
    this.id = id;
    this.name = name;
    this.cover = cover;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
