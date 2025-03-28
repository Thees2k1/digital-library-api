import { PersistenceAuthorRepository } from '../persistence-author-repository';
import { PrismaClient, Author } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { AuthorEntity } from '@src/features/author/domain/entities/author-entity';

describe('PersistenceAuthorRepository', () => {
  let repository: PersistenceAuthorRepository;
  let prisma: jest.Mocked<PrismaClient>;

  // Sample data for tests
  const mockAuthorData: Author = {
    id: 'author-id',
    name: 'John Doe',
    avatar: 'avatar-url',
    birthDate: new Date('1980-01-01'),
    deathDate: null,
    country: 'USA',
    bio: 'A great author',
    createdAt: new Date(),
    updatedAt: new Date(),
    popularityPoints: 100,
  };

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    repository = new PersistenceAuthorRepository(prisma);
  });

  describe('getList', () => {
    it('should return a list of authors', async () => {
      (prisma.author.findMany as jest.Mock).mockResolvedValue([mockAuthorData]);

      const result = await repository.getList({ paging: { limit: 20 } });

      expect(prisma.author.findMany).toHaveBeenCalledWith({
        take: 20,
        skip: 0,
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AuthorEntity);
      expect(result[0].id).toBe('author-id');
    });

    it('should handle pagination with cursor', async () => {
      (prisma.author.findMany as jest.Mock).mockResolvedValue([mockAuthorData]);

      const result = await repository.getList({
        paging: { limit: 10, cursor: 'some-cursor' },
      });

      expect(prisma.author.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 1,
        cursor: { id: 'some-cursor' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should return an author when found', async () => {
      (prisma.author.findUnique as jest.Mock).mockResolvedValue(mockAuthorData);

      const result = await repository.getById('author-id');

      expect(prisma.author.findUnique).toHaveBeenCalledWith({
        where: { id: 'author-id' },
      });
      expect(result).toBeInstanceOf(AuthorEntity);
      expect(result?.id).toBe('author-id');
      expect(result?.name).toBe('John Doe');
    });

    it('should return null when author is not found', async () => {
      (prisma.author.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.getById('non-existent-id');

      expect(prisma.author.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(result).toBeNull();
    });
  });

  describe('getByName', () => {
    it('should return an author when found by name', async () => {
      (prisma.author.findFirst as jest.Mock).mockResolvedValue(mockAuthorData);

      const result = await repository.getByName('John Doe');

      expect(prisma.author.findFirst).toHaveBeenCalledWith({
        where: { name: 'John Doe' },
      });
      expect(result).toBeInstanceOf(AuthorEntity);
      expect(result?.name).toBe('John Doe');
    });

    it('should return null when no author with the given name exists', async () => {
      (prisma.author.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.getByName('Unknown Author');

      expect(prisma.author.findFirst).toHaveBeenCalledWith({
        where: { name: 'Unknown Author' },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new author and return it', async () => {
      const createData = {
        name: 'New Author',
        avatar: 'new-avatar',
        birthDate: new Date('1990-01-01'),
        country: 'Canada',
        bio: 'A rising star',
      };

      (prisma.author.create as jest.Mock).mockResolvedValue({
        id: 'new-id',
        ...createData,
        deathDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        popularityPoints: 0,
      });

      const result = await repository.create(createData);

      expect(prisma.author.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Author',
          avatar: 'new-avatar',
          birthDate: expect.any(Date),
        }),
      });
      expect(result).toBeInstanceOf(AuthorEntity);
      expect(result.id).toBe('new-id');
      expect(result.name).toBe('New Author');
    });
  });

  describe('update', () => {
    it('should update an author', async () => {
      const updateData = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };

      await repository.update('author-id', updateData);

      expect(prisma.author.update).toHaveBeenCalledWith({
        where: { id: 'author-id' },
        data: expect.objectContaining({
          name: 'Updated Name',
          bio: 'Updated bio',
        }),
      });
    });
  });

  describe('delete', () => {
    it('should delete an author', async () => {
      await repository.delete('author-id');

      expect(prisma.author.delete).toHaveBeenCalledWith({
        where: { id: 'author-id' },
      });
    });
  });

  describe('count', () => {
    it('should return the count of authors matching a filter', async () => {
      (prisma.author.count as jest.Mock).mockResolvedValue(5);

      const result = await repository.count({});

      expect(prisma.author.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toBe(5);
    });
  });

  describe('getPopularAuthors', () => {
    it('should return popular authors ordered by popularity points', async () => {
      (prisma.author.findMany as jest.Mock).mockResolvedValue([
        mockAuthorData,
        { ...mockAuthorData, id: 'author-id-2', name: 'Jane Smith' },
      ]);

      const result = await repository.getPopularAuthors(2);

      expect(prisma.author.findMany).toHaveBeenCalledWith({
        take: 3, // limit + 1 for pagination
        skip: 0,
        orderBy: { popularityPoints: 'desc' },
      });
      expect(result.authors).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
    });

    it('should handle pagination with nextCursor', async () => {
      const authorsList = [
        mockAuthorData,
        { ...mockAuthorData, id: 'author-id-2', name: 'Jane Smith' },
        { ...mockAuthorData, id: 'author-id-3', name: 'Bob Wilson' },
      ];

      (prisma.author.findMany as jest.Mock).mockResolvedValue(authorsList);

      const result = await repository.getPopularAuthors(2);

      expect(result.authors).toHaveLength(2);
      expect(result.nextCursor).toBe('author-id-3');
    });

    it('should use the provided cursor for pagination', async () => {
      (prisma.author.findMany as jest.Mock).mockResolvedValue([mockAuthorData]);

      await repository.getPopularAuthors(10, 'some-cursor');

      expect(prisma.author.findMany).toHaveBeenCalledWith({
        take: 11,
        skip: 1,
        cursor: { id: 'some-cursor' },
        orderBy: { popularityPoints: 'desc' },
      });
    });
  });

  describe('updatePopularityPoints', () => {
    it("should update an author's popularity points", async () => {
      await repository.updatePopularityPoints('author-id', 150);

      expect(prisma.author.update).toHaveBeenCalledWith({
        where: { id: 'author-id' },
        data: { popularityPoints: 150 },
      });
    });
  });

  describe('getAll', () => {
    it('should return all authors', async () => {
      (prisma.author.findMany as jest.Mock).mockResolvedValue([
        mockAuthorData,
        { ...mockAuthorData, id: 'author-id-2', name: 'Jane Smith' },
      ]);

      const result = await repository.getAll();

      expect(prisma.author.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(AuthorEntity);
      expect(result[1]).toBeInstanceOf(AuthorEntity);
    });
  });

  describe('static methods', () => {
    it('convertToAuthorEntity should convert DB data to AuthorEntity', () => {
      const result =
        PersistenceAuthorRepository.convertToAuthorEntity(mockAuthorData);

      expect(result).toBeInstanceOf(AuthorEntity);
      expect(result.id).toBe('author-id');
      expect(result.name).toBe('John Doe');
      expect(result.avatar).toBe('avatar-url');
      expect(result.birthDate).toEqual(new Date('1980-01-01'));
      expect(result.books).toEqual([]);
    });

    it('convertToDbModel should convert partial AuthorEntity to DB model', () => {
      const authorEntity = new AuthorEntity(
        'author-id',
        'John Doe',
        'avatar-url',
        new Date('1980-01-01'),
        null,
        'USA',
        'A great author',
        new Date(),
        new Date(),
        [],
      );

      const result = PersistenceAuthorRepository.convertToDbModel(authorEntity);

      expect(result).toEqual({
        id: 'author-id',
        name: 'John Doe',
        avatar: 'avatar-url',
        birthDate: expect.any(Date),
        deathDate: null,
        country: 'USA',
        bio: 'A great author',
      });
    });

    it('convertToDbModel should handle partial data without id', () => {
      const partialData = {
        name: 'John Doe',
        birthDate: new Date('1980-01-01'),
      };

      const result = PersistenceAuthorRepository.convertToDbModel(partialData);

      expect(result).toEqual({
        name: 'John Doe',
        avatar: null,
        birthDate: expect.any(Date),
        deathDate: null,
        country: null,
        bio: null,
      });
      expect(result).not.toHaveProperty('id');
    });
  });
});
