class BookEntity {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly description: string,
    public readonly releaseDate: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly author: string,
    public readonly categories: CategoryEntity[],
    public readonly reviews?: ReviewEntity[],
  ) {}

  // `copyWith` method to create a new instance with updated properties
  copyWith(updates: Partial<BookEntity>): BookEntity {
    return new BookEntity(
      updates.id ?? this.id,
      updates.title ?? this.title,
      updates.description ?? this.description,
      updates.releaseDate ?? this.releaseDate,
      updates.createdAt ?? this.createdAt,
      updates.updatedAt ?? this.updatedAt,
      updates.author ?? this.author,
      updates.categories ?? this.categories,
      updates.reviews ?? this.reviews,
    );
  }
}
