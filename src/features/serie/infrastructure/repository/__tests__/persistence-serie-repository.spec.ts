import { PrismaClient, Serie, SerieStatus } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { PersistenceSerieRepository } from '../persistence-serie-repository';
import { SerieEntity } from '../../../domain/entities/serie-entity';

describe('PersistenceSerieRepository', () => {
  let repository: PersistenceSerieRepository;
  let prisma: jest.Mocked<PrismaClient>;

  const mockSerie: Serie = {
    id: 'serie-id',
    name: 'Test Serie',
    cover: 'cover-url.jpg',
    description: 'Serie description',
    status: SerieStatus.ongoing,
    releaseDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    repository = new PersistenceSerieRepository(prisma);
  });

  describe('count', () => {
    it('should count series based on filter', async () => {
      (prisma.serie.count as jest.Mock).mockResolvedValue(3);

      const result = await repository.count({});

      expect(result).toBe(3);
      expect(prisma.serie.count).toHaveBeenCalledWith({ where: {} });
    });
  });

  describe('getList', () => {
    it('should get a list of series', async () => {
      (prisma.serie.findMany as jest.Mock).mockResolvedValue([mockSerie]);

      const result = await repository.getList({ paging: { limit: 10 } });

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(SerieEntity);
      expect(result[0].id).toBe(mockSerie.id);
      expect(prisma.serie.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        include: { books: true },
      });
    });

    it('should handle cursor-based pagination', async () => {
      (prisma.serie.findMany as jest.Mock).mockResolvedValue([mockSerie]);

      await repository.getList({
        paging: {
          limit: 10,
          cursor: 'cursor-id',
        },
      });

      expect(prisma.serie.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 1,
        cursor: { id: 'cursor-id' },
        include: { books: true },
      });
    });
  });

  describe('getById', () => {
    it('should return serie by id', async () => {
      (prisma.serie.findUnique as jest.Mock).mockResolvedValue({
        ...mockSerie,
        books: [],
      });

      const result = await repository.getById('serie-id');

      expect(result).toBeInstanceOf(SerieEntity);
      expect(result?.id).toBe(mockSerie.id);
      expect(prisma.serie.findUnique).toHaveBeenCalledWith({
        where: { id: 'serie-id' },
        include: { books: true },
      });
    });

    it('should return null if serie not found', async () => {
      (prisma.serie.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.getById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getByNameAsync', () => {
    it('should return serie by name', async () => {
      (prisma.serie.findFirst as jest.Mock).mockResolvedValue(mockSerie);

      const result = await repository.getByNameAsync('Test Serie');

      expect(result).toBeInstanceOf(SerieEntity);
      expect(result?.name).toBe(mockSerie.name);
      expect(prisma.serie.findFirst).toHaveBeenCalledWith({
        where: { name: 'Test Serie' },
      });
    });

    it('should return null if no serie with given name', async () => {
      (prisma.serie.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.getByNameAsync('Non-existent Serie');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a serie', async () => {
      const serieData: Partial<SerieEntity> = {
        name: 'New Serie',
        description: 'New description',
        status: SerieStatus.planned,
        releaseDate: new Date(),
      };

      (prisma.serie.create as jest.Mock).mockResolvedValue({
        ...mockSerie,
        ...serieData,
        id: 'new-serie-id',
      });

      const result = await repository.create(serieData);

      expect(result).toBeInstanceOf(SerieEntity);
      expect(result.name).toBe(serieData.name);
      expect(prisma.serie.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: serieData.name,
          description: serieData.description,
          status: serieData.status,
          releaseDate: serieData.releaseDate,
        }),
      });
    });
  });

  describe('update', () => {
    it('should update a serie', async () => {
      const updateData: Partial<SerieEntity> = {
        id: 'serie-id',
        name: 'Updated Serie',
        status: SerieStatus.completed,
      };

      await repository.update('serie-id', updateData);

      expect(prisma.serie.update).toHaveBeenCalledWith({
        where: { id: 'serie-id' },
        data: expect.objectContaining({
          name: updateData.name,
          status: updateData.status,
        }),
      });
    });
  });

  describe('delete', () => {
    it('should delete a serie', async () => {
      await repository.delete('serie-id');

      expect(prisma.serie.delete).toHaveBeenCalledWith({
        where: { id: 'serie-id' },
      });
    });
  });
});
