import { CacheService } from '@src/core/interfaces/cache-service';
import { mockDeep } from 'jest-mock-extended';
import { SerieService } from '../serie-service';
import { SerieRepository } from '../../../domain/repository/serie-repository';
import { SerieEntity } from '../../../domain/entities/serie-entity';
import { AppError } from '@src/core/errors/custom-error';
import { SerieStatus } from '@prisma/client';
import { SerieCreateDto } from '../../dto/serie-dtos';

describe('SerieService', () => {
  let service: SerieService;
  let repository: jest.Mocked<SerieRepository>;
  let cacheService: jest.Mocked<CacheService>;

  const mockSerie = new SerieEntity(
    'serie-id',
    'Test Serie',
    'cover-url.jpg',
    'Serie description',
    SerieStatus.ongoing,
    [],
    new Date(),
    new Date(),
    new Date(),
  );

  beforeEach(() => {
    repository = mockDeep<SerieRepository>();
    cacheService = mockDeep<CacheService>();
    service = new SerieService(repository, cacheService);

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
    it('should throw error if serie already exists', async () => {
      repository.getByNameAsync.mockResolvedValue(mockSerie);

      const mockParams: SerieCreateDto = {
        name: 'Test Serie',
        books: [],
        description: 'Serie description',
        releaseDate: new Date().toString(),
        status: SerieStatus.ongoing,
      };

      await expect(service.create(mockParams)).rejects.toThrow(AppError);

      expect(repository.getByNameAsync).toHaveBeenCalledWith('Test Serie');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should create a serie successfully', async () => {
      repository.getByNameAsync.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockSerie);

      const mockParams: SerieCreateDto = {
        name: 'Test Serie',
        books: [],
        description: 'Serie description',
        releaseDate: new Date().toString(),
        status: SerieStatus.ongoing,
      };

      const result = await service.create(mockParams);

      expect(result).toEqual(
        expect.objectContaining({
          id: mockSerie.id,
          name: mockSerie.name,
          description: mockSerie.description,
        }),
      );
      expect(repository.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw error if serie not found', async () => {
      repository.getById.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', {
          name: 'Updated Serie',
        }),
      ).rejects.toThrow(AppError);

      expect(repository.getById).toHaveBeenCalledWith('non-existent-id');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should update serie successfully', async () => {
      repository.getById.mockResolvedValue(mockSerie);

      const result = await service.update('serie-id', {
        name: 'Updated Serie',
        status: SerieStatus.completed,
      });

      expect(result).toBe('serie-id');
      expect(repository.update).toHaveBeenCalledWith(
        'serie-id',
        expect.objectContaining({
          name: 'Updated Serie',
          status: SerieStatus.completed,
          updatedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('getList', () => {
    const params = { paging: { limit: 10 } };

    it('should return cached data if available', async () => {
      const cachedData = {
        data: [{ id: 'cached-id', name: 'Cached Serie' }],
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
      repository.getList.mockResolvedValue([mockSerie]);
      repository.count.mockResolvedValue(1);

      const result = await service.getList(params);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(mockSerie.id);
      expect(repository.getList).toHaveBeenCalledWith(params);
      expect(repository.count).toHaveBeenCalledWith(params);
      expect(cacheService.set).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return cached serie if available', async () => {
      const cachedSerie = {
        id: 'serie-id',
        name: 'Cached Serie',
      };

      cacheService.get.mockResolvedValue(cachedSerie);

      const result = await service.getById('serie-id');

      expect(result).toEqual(cachedSerie);
      expect(repository.getById).not.toHaveBeenCalled();
    });

    it('should fetch and cache serie if not in cache', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.getById.mockResolvedValue(mockSerie);

      const result = await service.getById('serie-id');

      expect(result?.id).toBe(mockSerie.id);
      expect(repository.getById).toHaveBeenCalledWith('serie-id');
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should return null if serie not found', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.getById.mockResolvedValue(null);

      const result = await service.getById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should throw error if serie not found', async () => {
      repository.getById.mockResolvedValue(null);

      await expect(service.delete('non-existent-id')).rejects.toThrow(AppError);

      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should delete serie successfully', async () => {
      repository.getById.mockResolvedValue(mockSerie);

      const result = await service.delete('serie-id');

      expect(result).toBe('serie-id');
      expect(repository.delete).toHaveBeenCalledWith('serie-id');
    });
  });
});
