import { Genre, PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { GenreEntity } from '../../../domain/entities/genre-entity';
import { PersistenceGenreRepository } from '../persistence-genre-repository';

describe('PersistenceGenreRepository', () => {
  let repository: PersistenceGenreRepository;
  let prisma: jest.Mocked<PrismaClient>;

  const mockGenre: Genre = {
    id: 'genre-id',
    name: 'Test Genre',
    description: 'Test description',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    repository = new PersistenceGenreRepository(prisma);
  });

  describe('count', () => {
    it('should return the count of genres', async () => {
      (prisma.genre.count as jest.Mock).mockResolvedValue(10);

      const result = await repository.count({});

      expect(result).toBe(10);
      expect(prisma.genre.count).toHaveBeenCalledWith({ where: {} });
    });
  });

  describe('getList', () => {
    it('should return a list of genres', async () => {
      (prisma.genre.findMany as jest.Mock).mockResolvedValue([mockGenre]);

      const result = await repository.getList({
        paging: { limit: 20 },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(GenreEntity);
      expect(result[0].id).toBe('genre-id');
      expect(prisma.genre.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 0,
        }),
      );
    });

    it('should handle cursor-based pagination', async () => {
      (prisma.genre.findMany as jest.Mock).mockResolvedValue([mockGenre]);

      await repository.getList({
        paging: { cursor: 'cursor-id', limit: 10 },
      });

      expect(prisma.genre.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 1,
          cursor: { id: 'cursor-id' },
        }),
      );
    });

    it('should apply sort options if provided', async () => {
      (prisma.genre.findMany as jest.Mock).mockResolvedValue([mockGenre]);

      await repository.getList({
        paging: { limit: 20 },
        sort: { field: 'name', order: 'asc' },
      });

      expect(prisma.genre.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([
            expect.objectContaining({ name: 'asc' }),
          ]),
        }),
      );
    });
  });

  describe('getById', () => {
    it('should return a genre when found', async () => {
      (prisma.genre.findUnique as jest.Mock).mockResolvedValue(mockGenre);

      const result = await repository.getById('genre-id');

      expect(result).toBeInstanceOf(GenreEntity);
      expect(result?.id).toBe('genre-id');
      expect(prisma.genre.findUnique).toHaveBeenCalledWith({
        where: { id: 'genre-id' },
      });
    });

    it('should return null when genre not found', async () => {
      (prisma.genre.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.getById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getByNameAsync', () => {
    it('should return a genre when found by name', async () => {
      (prisma.genre.findFirst as jest.Mock).mockResolvedValue(mockGenre);

      const result = await repository.getByNameAsync('Test Genre');

      expect(result).toBeInstanceOf(GenreEntity);
      expect(result?.name).toBe('Test Genre');
      expect(prisma.genre.findFirst).toHaveBeenCalledWith({
        where: { name: 'Test Genre' },
      });
    });

    it('should return null when name not found', async () => {
      (prisma.genre.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.getByNameAsync('Non-existent Genre');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new genre', async () => {
      (prisma.genre.create as jest.Mock).mockResolvedValue(mockGenre);

      const genreData: Partial<GenreEntity> = {
        name: 'Test Genre',
        description: 'Test description',
      };

      const result = await repository.create(genreData);

      expect(result).toBeInstanceOf(GenreEntity);
      expect(result.name).toBe('Test Genre');
      expect(prisma.genre.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Genre',
          description: 'Test description',
        }),
      });
    });
  });

  describe('update', () => {
    it('should update an existing genre', async () => {
      const updateData: Partial<GenreEntity> = {
        name: 'Updated Genre',
        description: 'Updated description',
      };

      await repository.update('genre-id', updateData);

      expect(prisma.genre.update).toHaveBeenCalledWith({
        where: { id: 'genre-id' },
        data: expect.objectContaining({
          name: 'Updated Genre',
          description: 'Updated description',
        }),
      });
    });
  });

  describe('delete', () => {
    it('should delete a genre', async () => {
      await repository.delete('genre-id');

      expect(prisma.genre.delete).toHaveBeenCalledWith({
        where: { id: 'genre-id' },
      });
    });
  });
});
