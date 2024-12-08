export class BookDigitalItemEntity {
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
