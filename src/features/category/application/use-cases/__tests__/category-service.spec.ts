import { mockDeep } from 'jest-mock-extended';
import { CategoryService } from '../category-service';
import { CategoryRepository } from '../../../domain/repository/category-repository';
import { CacheService } from '@src/core/interfaces/cache-service';
import { CategoryEntity } from '../../../domain/entities/category';
import { AppError } from '@src/core/errors/custom-error';
import { generateCacheKey } from '@src/core/utils/generate-cache-key';

jest.mock('@src/core/utils/generate-cache-key', () => ({
  generateCacheKey: jest.fn().mockReturnValue('cache-key'),
}));

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: jest.Mocked<CategoryRepository>;
  let cacheService: jest.Mocked<CacheService>;

  const mockCategory = new CategoryEntity(
    'category-id',
    'Test Category',
    'test-cover.jpg',
    'Test description',
    new Date(),
    new Date(),
  );

  beforeEach(() => {
    repository = mockDeep<CategoryRepository>();
    cacheService = mockDeep<CacheService>();
    service = new CategoryService(repository, cacheService);

    // Reset generateCacheKey mock
    (generateCacheKey as jest.Mock).mockReturnValue('cache-key');
  });

  describe('create', () => {
    it('should throw an error if category with the same name already exists', async () => {
      repository.getByNameAsync.mockResolvedValue(mockCategory);

      await expect(service.create({ name: 'Test Category' })).rejects.toThrow(
        AppError.forbidden('existed category.'),
      );

      expect(repository.getByNameAsync).toHaveBeenCalledWith('Test Category');
    });

    it('should create a new category if name is unique', async () => {
      repository.getByNameAsync.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockCategory);

      const result = await service.create({
        name: 'Test Category',
        description: 'Test description',
        cover: 'test-cover.jpg',
      });

      expect(result).toEqual({
        id: 'category-id',
        name: 'Test Category',
        description: 'Test description',
        cover: 'test-cover.jpg',
        updatedAt: expect.any(Date),
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Category',
          description: 'Test description',
          cover: 'test-cover.jpg',
        }),
      );
    });
  });

  describe('update', () => {
    it('should throw an error if category does not exist', async () => {
      repository.getById.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'New Name' }),
      ).rejects.toThrow(AppError.notFound('category not found.'));

      expect(repository.getById).toHaveBeenCalledWith('non-existent-id');
    });

    it('should update a category if it exists', async () => {
      repository.getById.mockResolvedValue(mockCategory);

      const result = await service.update('category-id', {
        name: 'Updated Category',
        description: 'Updated description',
      });

      expect(result).toBe('category-id');

      expect(repository.update).toHaveBeenCalledWith(
        'category-id',
        expect.objectContaining({
          name: 'Updated Category',
          description: 'Updated description',
          updatedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('getList', () => {
    it('should return cached data if available', async () => {
      const cachedData = {
        data: [],
        limit: 20,
        hasNextPage: false,
        nextCursor: '',
        total: 0,
      };
      cacheService.get.mockResolvedValue(cachedData);

      const result = await service.getList({ paging: { limit: 20 } });

      expect(result).toBe(cachedData);
      expect(generateCacheKey).toHaveBeenCalledWith('category', {
        paging: { limit: 20 },
      });
      expect(cacheService.get).toHaveBeenCalledWith('cache-key');
      expect(repository.getList).not.toHaveBeenCalled();
    });

    it('should fetch and cache data if cache misses', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.getList.mockResolvedValue([mockCategory]);
      repository.count.mockResolvedValue(1);

      const result = await service.getList({ paging: { limit: 20 } });

      expect(result).toEqual({
        data: [
          {
            id: 'category-id',
            name: 'Test Category',
            description: 'Test description',
            cover: 'test-cover.jpg',
            updatedAt: expect.any(Date),
          },
        ],
        limit: 20,
        hasNextPage: false,
        nextCursor: '',
        total: 1,
      });

      expect(repository.getList).toHaveBeenCalledWith({
        paging: { limit: 20 },
      });
      expect(cacheService.set).toHaveBeenCalledWith('cache-key', result, {
        EX: 60,
      });
    });
  });

  describe('getById', () => {
    it('should return cached data if available', async () => {
      const cachedData = {
        id: 'category-id',
        name: 'Test Category',
        description: 'Test description',
        cover: 'test-cover.jpg',
        updatedAt: new Date(),
      };

      cacheService.get.mockResolvedValue(cachedData);

      const result = await service.getById('category-id');

      expect(result).toBe(cachedData);
      expect(generateCacheKey).toHaveBeenCalledWith('category', {
        id: 'category-id',
      });
      expect(cacheService.get).toHaveBeenCalledWith('cache-key');
      expect(repository.getById).not.toHaveBeenCalled();
    });

    it('should fetch and cache data if cache misses', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.getById.mockResolvedValue(mockCategory);

      const result = await service.getById('category-id');

      expect(result).toEqual({
        id: 'category-id',
        name: 'Test Category',
        description: 'Test description',
        cover: 'test-cover.jpg',
        updatedAt: expect.any(Date),
      });

      expect(repository.getById).toHaveBeenCalledWith('category-id');
      expect(cacheService.set).toHaveBeenCalledWith('cache-key', result, {
        EX: 60,
      });
    });

    it('should return null if category does not exist', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.getById.mockResolvedValue(null);

      const result = await service.getById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a category and return its id', async () => {
      const result = await service.delete('category-id');

      expect(result).toBe('category-id');
      expect(repository.delete).toHaveBeenCalledWith('category-id');
    });
  });

  describe('getPopularCategories', () => {
    it('should return cached data if available', async () => {
      const cachedData = {
        data: [],
        limit: 10,
        hasNextPage: false,
        nextCursor: '',
        total: 0,
      };
      cacheService.get.mockResolvedValue(cachedData);

      const result = await service.getPopularCategories({
        paging: { limit: 10 },
      });

      expect(result).toBe(cachedData);
      expect(generateCacheKey).toHaveBeenCalledWith('popular_categories', {
        paging: { limit: 10 },
      });
      expect(cacheService.get).toHaveBeenCalledWith('cache-key');
    });

    it('should fetch and cache popular categories if cache misses', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.getList.mockResolvedValue([mockCategory]);
      repository.count.mockResolvedValue(1);

      const result = await service.getPopularCategories({
        paging: { limit: 10 },
      });

      expect(result).toEqual({
        data: [
          {
            id: 'category-id',
            name: 'Test Category',
            description: 'Test description',
            cover: 'test-cover.jpg',
            updatedAt: expect.any(Date),
          },
        ],
        limit: 10,
        hasNextPage: false,
        nextCursor: '',
        total: 1,
      });

      expect(repository.getList).toHaveBeenCalledWith({
        paging: { limit: 10 },
        sort: { field: 'popularityPoints', order: 'desc' },
      });

      expect(cacheService.set).toHaveBeenCalledWith('cache-key', result, {
        EX: 60,
      });
    });
  });
});
