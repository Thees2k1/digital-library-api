import {
  Author,
  Category,
  DigitalItemData,
  Genre,
  Publisher,
  Review,
} from '../interfaces/models';

export class BookEntity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly cover: string,
    public readonly createdAt: Date,
    public readonly author: Author,
    public readonly reviews?: Review[],
    public readonly description?: string,
    public readonly pages?: number,
    public readonly language?: string,
    public readonly releaseDate?: Date,
    public readonly updatedAt?: Date,
    public readonly category?: Category,
    public readonly publisher?: Publisher,
    public readonly genres?: Genre[],
    public readonly digitalItems?: DigitalItemData[],
    public readonly likes?: number,
  ) {}

  copyWith(updates: Partial<BookEntity>): BookEntity {
    return new BookEntity(
      updates.id ?? this.id,
      updates.title ?? this.title,
      updates.cover ?? this.cover,
      updates.createdAt ?? this.createdAt,
      updates.author ?? this.author,
      updates.reviews ?? this.reviews,
      updates.description ?? this.description,
      updates.pages ?? this.pages,
      updates.language ?? this.language,
      updates.releaseDate ?? this.releaseDate,
      updates.updatedAt ?? this.updatedAt,
      updates.category ?? this.category,
      updates.publisher ?? this.publisher,
      updates.genres ?? this.genres,
      updates.digitalItems ?? this.digitalItems,
      updates.likes ?? this.likes,
    );
  }

  get averageRating(): number {
    if (!this.reviews || this.reviews.length === 0) {
      return 0;
    }

    const totalRating = this.reviews.reduce((acc, review) => {
      return acc + review.rating;
    }, 0);

    return totalRating / this.reviews.length;
  }
}
