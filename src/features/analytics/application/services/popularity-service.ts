import { DI_TYPES } from '@src/core/di/types';
import { AuthorRepository } from '@src/features/author/domain/repository/author-repository';
import { CategoryRepository } from '@src/features/category/domain/repository/category-repository';
import { SerieRepository } from '@src/features/serie/domain/repository/serie-repository';
import { inject, injectable } from 'inversify';

@injectable()
export class PopularityService {
  constructor(
    @inject(DI_TYPES.AuthorRepository) private authorRepo: AuthorRepository,
    @inject(DI_TYPES.CategoryRepository)
    private categoryRepo: CategoryRepository,
    @inject(DI_TYPES.SerieRepository)
    private serieRepo: SerieRepository,
  ) {}

  async calculateAuthorPopularity(): Promise<void> {
    const authors = await this.authorRepo.getAll();

    for (const author of authors) {
      const popularityPoints = author.books.length * 10; // Example logic
      await this.authorRepo.updatePopularityPoints(author.id, popularityPoints);
    }
  }

  async calculateCategoryPopularity(): Promise<void> {
    const categories = await this.categoryRepo.getAll();
    for (const category of categories) {
      const popularityPoints = category.books.length * 5; // Example logic
      await this.categoryRepo.updatePopularityPoints(
        category.id,
        popularityPoints,
      );
    }
  }

  async calculateSeriePopularity(): Promise<void> {
    const series = await this.serieRepo.getAll();
    for (const serie of series) {
      const popularityPoints = serie.books.length * 8; // Example logic
      await this.serieRepo.updatePopularityPoints(serie.id, popularityPoints);
    }
  }
}
