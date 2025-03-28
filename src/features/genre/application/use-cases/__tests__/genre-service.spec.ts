import { mockDeep } from 'jest-mock-extended';
import { GenreService } from '../genre-service';
import { GenreRepository } from '../../../domain/repository/genre-repository';
import { CacheService } from '@src/core/interfaces/cache-service';
import { GenreEntity } from '../../../domain/entities/genre-entity';
import { AppError } from '@src/core/errors/custom-error';
import { generateCacheKey } from '@src/core/utils/generate-cache-key';

jest.mock('@src/core/utils/generate-cache-key', () => ({
  generateCacheKey: jest.fn().mockReturnValue('cache-key'),
}));

describe('GenreService', () => {
  let service: GenreService;
  let repository: jest.Mocked<GenreRepository>;
  let cacheService: jest.Mocked<CacheService>;

  const mockGenre = new GenreEntity(
    'genre-id',
    'Test Genre',
    'Test description',
    new Date(),
    new Date(),
  );

  beforeEach(() => {
    repository = mockDeep<GenreRepository>();
    cacheService = mockDeep<CacheService>();
    service = new GenreService(repository, cacheService);

    // Reset generateCacheKey mock
    (generateCacheKey as jest.Mock).mockReturnValue('cache-key');
  });

  describe('create', () => {
    it('should throw an error if genre with the same name already exists', async () => {
      repository.getByNameAsync.mockResolvedValue(mockGenre);

      await expect(service.create({ name: 'Test Genre' })).rejects.toThrow(
        AppError.forbidden('existed Genre.'),
      );

      expect(repository.getByNameAsync).toHaveBeenCalledWith('Test Genre');
    });

    it('should create a new genre if name is unique', async () => {
      repository.getByNameAsync.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockGenre);

      const result = await service.create({
        name: 'Test Genre',
        description: 'Test description',
      });

      expect(result).toEqual({
        id: 'genre-id',
        name: 'Test Genre',
        description: 'Test description',
        updatedAt: expect.any(Date),
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Genre',
          description: 'Test description',
        }),
      );
    });
  });

  describe('update', () => {
    it('should throw an error if genre does not exist', async () => {
      repository.getById.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'New Name' }),
      ).rejects.toThrow(AppError.notFound('Genre not found.'));

      expect(repository.getById).toHaveBeenCalledWith('non-existent-id');
    });

    it('should update a genre if it exists', async () => {
      repository.getById.mockResolvedValue(mockGenre);

      const result = await service.update('genre-id', {
        name: 'Updated Genre',
        description: 'Updated description',
      });

      expect(result).toBe('genre-id');

      expect(repository.update).toHaveBeenCalledWith(
        'genre-id',
        expect.objectContaining({
          name: 'Updated Genre',
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
        paging: {
          total: 0,
          limit: 20,
          hasNextPage: false,
          nextCursor: '',
        },
      };

      cacheService.get.mockResolvedValue(cachedData);

      const result = await service.getList({ paging: { limit: 20 } });

      expect(result).toBe(cachedData);
      expect(generateCacheKey).toHaveBeenCalledWith('genres', {
        paging: { limit: 20 },
      });
      expect(cacheService.get).toHaveBeenCalledWith('cache-key');
      expect(repository.getList).not.toHaveBeenCalled();
    });

    it('should fetch and cache data if cache misses', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.getList.mockResolvedValue([mockGenre]);
      repository.count.mockResolvedValue(1);

      const result = await service.getList({ paging: { limit: 20 } });

      expect(result).toEqual({
        data: [
          {
            id: 'genre-id',
            name: 'Test Genre',
            description: 'Test description',
            updatedAt: expect.any(Date),
          },
        ],
        paging: {
          total: 1,
          limit: 20,
          hasNextPage: false,
          nextCursor: '',
        },
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
        id: 'genre-id',
        name: 'Test Genre',
        description: 'Test description',
        updatedAt: new Date(),
      };

      cacheService.get.mockResolvedValue(cachedData);

      const result = await service.getById('genre-id');

      expect(result).toBe(cachedData);
      expect(generateCacheKey).toHaveBeenCalledWith('genre', {
        id: 'genre-id',
      });
      expect(cacheService.get).toHaveBeenCalledWith('cache-key');
      expect(repository.getById).not.toHaveBeenCalled();
    });

    it('should fetch and cache data if cache misses', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.getById.mockResolvedValue(mockGenre);

      const result = await service.getById('genre-id');

      expect(result).toEqual({
        id: 'genre-id',
        name: 'Test Genre',
        description: 'Test description',
        updatedAt: expect.any(Date),
      });

      expect(repository.getById).toHaveBeenCalledWith('genre-id');
      expect(cacheService.set).toHaveBeenCalledWith('cache-key', result);
    });

    it('should return null if genre does not exist', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.getById.mockResolvedValue(null);

      const result = await service.getById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should throw an error if genre does not exist', async () => {
      repository.getById.mockResolvedValue(null);

      await expect(service.delete('non-existent-id')).rejects.toThrow(
        AppError.notFound('Genre not found.'),
      );

      expect(repository.getById).toHaveBeenCalledWith('non-existent-id');
    });

    it('should delete a genre and return its id', async () => {
      repository.getById.mockResolvedValue(mockGenre);

      const result = await service.delete('genre-id');

      expect(result).toBe('genre-id');
      expect(repository.delete).toHaveBeenCalledWith('genre-id');
    });
  });
});
