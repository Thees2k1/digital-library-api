import { CacheService } from '@src/core/interfaces/cache-service';
import { mockDeep } from 'jest-mock-extended';
import { TagService } from '../tag-service';
import { TagRepository } from '../../../domain/repository/tag-repository';
import { TagEntity } from '../../../domain/entities/tag-entity';
import { AppError } from '@src/core/errors/custom-error';

describe('TagService', () => {
  let service: TagService;
  let repository: jest.Mocked<TagRepository>;
  let cacheService: jest.Mocked<CacheService>;

  const mockTag = new TagEntity(
    'tag-id',
    'Test Tag',
    'Tag description',
    new Date(),
    new Date(),
  );

  beforeEach(() => {
    repository = mockDeep<TagRepository>();
    cacheService = mockDeep<CacheService>();
    service = new TagService(repository, cacheService);

    // Mock generateCacheKey behavior
    jest
      .spyOn(require('@src/core/utils/generate-cache-key'), 'generateCacheKey')
      .mockImplementation(
        (prefix, params) => `${prefix}:${JSON.stringify(params)}`,
      );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('should throw error if tag already exists', async () => {
      repository.getByNameAsync.mockResolvedValue(mockTag);

      await expect(
        service.create({
          name: 'Test Tag',
        }),
      ).rejects.toThrow(AppError);

      expect(repository.getByNameAsync).toHaveBeenCalledWith('Test Tag');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should create a tag successfully', async () => {
      repository.getByNameAsync.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockTag);

      const result = await service.create({
        name: 'Test Tag',
        description: 'Tag description',
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: mockTag.id,
          name: mockTag.name,
          description: mockTag.description,
        }),
      );
      expect(repository.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw error if tag not found', async () => {
      repository.getById.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', {
          name: 'Updated Tag',
        }),
      ).rejects.toThrow(AppError);

      expect(repository.getById).toHaveBeenCalledWith('non-existent-id');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should update tag successfully', async () => {
      repository.getById.mockResolvedValue(mockTag);

      const result = await service.update('tag-id', {
        name: 'Updated Tag',
        description: 'Updated description',
      });

      expect(result).toBe('tag-id');
      expect(repository.update).toHaveBeenCalledWith(
        'tag-id',
        expect.objectContaining({
          name: 'Updated Tag',
          description: 'Updated description',
          updatedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('getList', () => {
    const params = { paging: { limit: 10 } };

    it('should return cached data if available', async () => {
      const cachedData = {
        data: [{ id: 'cached-id', name: 'Cached Tag' }],
        paging: { total: 1, limit: 10, hasNextPage: false, nextCursor: '' },
      };

      cacheService.get.mockResolvedValue(cachedData);

      const result = await service.getList(params);

      expect(result).toEqual(cachedData);
      expect(repository.getList).not.toHaveBeenCalled();
      expect(repository.count).not.toHaveBeenCalled();
    });

    it('should fetch and cache data if not in cache', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.getList.mockResolvedValue([mockTag]);
      repository.count.mockResolvedValue(1);

      const result = await service.getList(params);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(mockTag.id);
      expect(repository.getList).toHaveBeenCalledWith(params);
      expect(repository.count).toHaveBeenCalledWith({});
      expect(cacheService.set).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return cached tag if available', async () => {
      const cachedTag = {
        id: 'tag-id',
        name: 'Cached Tag',
      };

      cacheService.get.mockResolvedValue(cachedTag);

      const result = await service.getById('tag-id');

      expect(result).toEqual(cachedTag);
      expect(repository.getById).not.toHaveBeenCalled();
    });

    it('should fetch and cache tag if not in cache', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.getById.mockResolvedValue(mockTag);

      const result = await service.getById('tag-id');

      expect(result?.id).toBe(mockTag.id);
      expect(repository.getById).toHaveBeenCalledWith('tag-id');
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should return null if tag not found', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.getById.mockResolvedValue(null);

      const result = await service.getById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should throw error if tag not found', async () => {
      repository.getById.mockResolvedValue(null);

      await expect(service.delete('non-existent-id')).rejects.toThrow(AppError);

      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should delete tag successfully', async () => {
      repository.getById.mockResolvedValue(mockTag);

      const result = await service.delete('tag-id');

      expect(result).toBe('tag-id');
      expect(repository.delete).toHaveBeenCalledWith('tag-id');
    });
  });
});
