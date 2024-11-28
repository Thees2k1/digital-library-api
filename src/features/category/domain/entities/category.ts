class CategoryEntity {
  private id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: CategoryEntity) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static create(data: CategoryEntity): CategoryEntity {
    return new CategoryEntity(data);
  }
}
