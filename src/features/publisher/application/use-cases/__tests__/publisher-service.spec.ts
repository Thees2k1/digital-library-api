import { AppError } from '@src/core/errors/custom-error';
import { CacheService } from '@src/core/interfaces/cache-service';
import { mockDeep } from 'jest-mock-extended';
import { PublisherEntity } from '../../../domain/entities/publisher-entity';
import { PublisherRepository } from '../../../domain/repository/publisher-repository';
import { PublisherService } from '../publisher-service';

describe('PublisherService', () => {
  let service: PublisherService;
  let repository: jest.Mocked<PublisherRepository>;
  let cacheService: jest.Mocked<CacheService>;

  const mockPublisher = new PublisherEntity(
    'publisher-id',
    'Test Publisher',
    'cover-url.jpg',
    'contact@publisher.com',
    'Publisher Address',
    new Date(),
    new Date(),
  );

  beforeEach(() => {
    repository = mockDeep<PublisherRepository>();
    cacheService = mockDeep<CacheService>();
    service = new PublisherService(repository);

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
    it('should throw error if publisher already exists', async () => {
      repository.getByNameAsync.mockResolvedValue(mockPublisher);

      await expect(service.create(mockPublisher)).rejects.toThrow(AppError);

      expect(repository.getByNameAsync).toHaveBeenCalledWith('Test Publisher');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should create a publisher successfully', async () => {
      repository.getByNameAsync.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockPublisher);

      const result = await service.create(mockPublisher);

      expect(result).toEqual(
        expect.objectContaining({
          id: mockPublisher.id,
          name: mockPublisher.name,
          contactInfo: mockPublisher.contactInfo,
        }),
      );
      expect(repository.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw error if publisher not found', async () => {
      repository.getById.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', {
          name: 'Updated Publisher',
        }),
      ).rejects.toThrow(AppError);

      expect(repository.getById).toHaveBeenCalledWith('non-existent-id');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should update publisher successfully', async () => {
      repository.getById.mockResolvedValue(mockPublisher);

      const result = await service.update('publisher-id', {
        name: 'Updated Publisher',
        address: 'Updated Address',
      });

      expect(result).toBe('publisher-id');
      expect(repository.update).toHaveBeenCalledWith(
        'publisher-id',
        expect.objectContaining({
          name: 'Updated Publisher',
          address: 'Updated Address',
          updatedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('getList', () => {
    const params = { paging: { limit: 10 } };

    // it('should return cached data if available', async () => {
    //   const cachedData = {
    //     data: [{ id: 'cached-id', name: 'Cached Publisher' }],
    //     paging: { total: 1, limit: 10, hasNextPage: false, nextCursor: '' },
    //   };

    //   cacheService.get.mockResolvedValue(cachedData);

    //   const result = await service.getList();

    //   expect(result).toEqual(cachedData);
    //   expect(repository.getList).not.toHaveBeenCalled();
    // });

    // it('should fetch and cache data if not in cache', async () => {
    //   cacheService.get.mockResolvedValue(null);
    //   repository.getList.mockResolvedValue([mockPublisher]);

    //   const result = await service.getList();

    //   expect(result).toHaveLength(1);
    //   expect(result[0].id).toBe(mockPublisher.id);
    //   expect(repository.getList).toHaveBeenCalledWith(params);
    //   expect(cacheService.set).toHaveBeenCalled();
    // });
  });

  // describe('getById', () => {
  //   it('should return cached publisher if available', async () => {
  //     const cachedPublisher = {
  //       id: 'publisher-id',
  //       name: 'Cached Publisher',
  //     };

  //     cacheService.get.mockResolvedValue(cachedPublisher);

  //     const result = await service.getById('publisher-id');

  //     expect(result).toEqual(cachedPublisher);
  //     expect(repository.getById).not.toHaveBeenCalled();
  //   });

  //   it('should fetch and cache publisher if not in cache', async () => {
  //     cacheService.get.mockResolvedValue(null);
  //     repository.getById.mockResolvedValue(mockPublisher);

  //     const result = await service.getById('publisher-id');

  //     expect(result?.id).toBe(mockPublisher.id);
  //     expect(repository.getById).toHaveBeenCalledWith('publisher-id');
  //     expect(cacheService.set).toHaveBeenCalled();
  //   });

  //   it('should return null if publisher not found', async () => {
  //     cacheService.get.mockResolvedValue(null);
  //     repository.getById.mockResolvedValue(null);

  //     const result = await service.getById('non-existent-id');

  //     expect(result).toBeNull();
  //   });
  // });

  describe('delete', () => {
    it('should throw error if publisher not found', async () => {
      repository.getById.mockResolvedValue(null);

      await expect(service.delete('non-existent-id')).rejects.toThrow(AppError);

      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should delete publisher successfully', async () => {
      repository.getById.mockResolvedValue(mockPublisher);

      const result = await service.delete('publisher-id');

      expect(result).toBe('publisher-id');
      expect(repository.delete).toHaveBeenCalledWith('publisher-id');
    });
  });
});
