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
    public readonly description: string,
    public readonly pages: number | undefined,
    public readonly language: string | undefined,
    public readonly releaseDate: Date | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly author: Author,
    public readonly category: Category,
    public readonly publisher: Publisher | undefined,
    public readonly genres: Genre[],
    public readonly reviews: Review[],
    public readonly digitalItems: DigitalItemData[],
  ) {}

  copyWith(updates: Partial<BookEntity>): BookEntity {
    return new BookEntity(
      updates.id ?? this.id,
      updates.title ?? this.title,
      updates.cover ?? this.cover,
      updates.description ?? this.description,
      updates.pages ?? this.pages,
      updates.language ?? this.language,
      updates.releaseDate ?? this.releaseDate,
      updates.createdAt ?? this.createdAt,
      updates.updatedAt ?? this.updatedAt,
      updates.author ?? this.author,
      updates.category ?? this.category,
      updates.publisher ?? this.publisher,
      updates.genres ?? this.genres,
      updates.reviews ?? this.reviews,
      updates.digitalItems ?? this.digitalItems,
    );
  }
}
