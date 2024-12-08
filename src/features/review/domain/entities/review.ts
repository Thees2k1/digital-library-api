export class ReviewEntity {
  constructor(
    public readonly id: number,
    public readonly bookId: number,
    public readonly rating: number,
    public readonly comment: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  // `copyWith` method to create a new instance with updated properties
  copyWith(updates: Partial<ReviewEntity>): ReviewEntity {
    return new ReviewEntity(
      updates.id ?? this.id,
      updates.bookId ?? this.bookId,
      updates.rating ?? this.rating,
      updates.comment ?? this.comment,
      updates.createdAt ?? this.createdAt,
      updates.updatedAt ?? this.updatedAt,
    );
  }

  // `toJSON` method to convert the entity to JSON
  toJSON(): any {
    return {
      id: this.id,
      bookId: this.bookId,
      rating: this.rating,
      comment: this.comment,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // `fromJSON` method to convert JSON to entity
  static fromJSON(data: any): ReviewEntity {
    return new ReviewEntity(
      data.id,
      data.bookId,
      data.rating,
      data.comment,
      data.createdAt,
      data.updatedAt,
    );
  }
}
