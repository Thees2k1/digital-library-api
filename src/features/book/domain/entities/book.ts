export class BookEntity {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly description: string,
    public readonly releaseDate: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly author: string,
    public readonly categories: Array<Category>,
    public readonly reviews: ReviewEntity[],
    public readonly digitalItems: BookDigitalItemEntity[],
  ) {}

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
      updates.digitalItems ?? this.digitalItems,
    );
  }
}

//entity for BookDigitalItem
class BookDigitalItemEntity {
  constructor(
    public readonly id: number,
    public readonly format: string,
    public readonly url: string,
  ) {}

  // `copyWith` method to create a new instance with updated properties
  copyWith(updates: Partial<BookDigitalItemEntity>): BookDigitalItemEntity {
    return new BookDigitalItemEntity(
      updates.id ?? this.id,
      updates.format ?? this.format,
      updates.url ?? this.url,
    );
  }
}

interface Category {
  id: string;
  name: string;
  cover: string;
}
