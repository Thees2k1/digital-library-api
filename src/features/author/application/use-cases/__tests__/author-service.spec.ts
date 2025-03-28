import { CacheService } from '@src/core/interfaces/cache-service';
import { AuthorService } from '../author-service';
import { AuthorRepository } from '@src/features/author/domain/repository/author-repository';
import { mockDeep } from 'jest-mock-extended';
import { AuthorEntity } from '@src/features/author/domain/entities/author-entity';
import { AppError } from '@src/core/errors/custom-error';
import { generateCacheKey } from '@src/core/utils/generate-cache-key';
import {
  AuthorCreateDto,
  AuthorUpdateDto,
  GetAuthorsParams,
} from '../../dtos/author-dto';

// Mock the external dependencies
jest.mock('@src/core/utils/generate-cache-key', () => ({
  generateCacheKey: jest.fn().mockReturnValue('cache-key'),
}));

describe('AuthorService', () => {
  let authorService: AuthorService;
  let authorRepository: jest.Mocked<AuthorRepository>;
  let cacheService: jest.Mocked<CacheService>;

  // Sample author entity for testing
  const mockAuthor: AuthorEntity = new AuthorEntity(
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

  beforeEach(() => {
    authorRepository = mockDeep<AuthorRepository>();
    cacheService = mockDeep<CacheService>();

    authorService = new AuthorService(authorRepository, cacheService);
    (generateCacheKey as jest.Mock).mockReturnValue('cache-key');
    // Reset mocks between tests
    jest.clearAllMocks();
  });

  describe('getList', () => {
    const params: GetAuthorsParams = {
      filter: {},
      sort: { field: '', order: 'asc' },
      paging: { limit: 10 },
    };

    it('should return cached data if available', async () => {
      const cachedResult = {
        data: [
          {
            id: 'author-id',
            name: 'John Doe',
            avatar: 'avatar-url',
            country: 'USA',
            birthDate: new Date('1980-01-01'),
            deathDate: null,
            age: 44,
            bio: 'A great author',
            bookCount: 0,
          },
        ],
        limit: 10,
        hasNextPage: false,
        nextCursor: '',
        total: 1,
      };

      cacheService.get.mockResolvedValue(cachedResult);

      const result = await authorService.getList(params);

      expect(generateCacheKey).toHaveBeenCalledWith('authors', params);
      expect(cacheService.get).toHaveBeenCalledWith('cache-key');
      expect(result).toEqual(cachedResult);
      expect(authorRepository.getList).not.toHaveBeenCalled();
    });

    it('should fetch data from repository and cache it when no cache available', async () => {
      cacheService.get.mockResolvedValue(null);
      authorRepository.getList.mockResolvedValue([mockAuthor]);
      authorRepository.count.mockResolvedValue(1);

      const result = await authorService.getList(params);

      expect(authorRepository.getList).toHaveBeenCalledWith(params);
      expect(authorRepository.count).toHaveBeenCalledWith({});
      expect(cacheService.set).toHaveBeenCalledWith(
        'cache-key',
        expect.objectContaining({
          data: expect.any(Array),
          limit: 10,
          total: 1,
        }),
        { EX: 60 },
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('author-id');
    });
  });

  describe('getById', () => {
    it('should return cached author if available', async () => {
      const cachedAuthor = {
        id: 'author-id',
        name: 'John Doe',
        avatar: 'avatar-url',
        country: 'USA',
        birthDate: new Date('1980-01-01'),
        deathDate: null,
        age: 44,
        bio: 'A great author',
        bookCount: 0,
      };

      cacheService.get.mockResolvedValue(cachedAuthor);

      const result = await authorService.getById('author-id');

      expect(generateCacheKey).toHaveBeenCalledWith('author', {
        id: 'author-id',
      });
      expect(cacheService.get).toHaveBeenCalledWith('cache-key');
      expect(result).toEqual(cachedAuthor);
      expect(authorRepository.getById).not.toHaveBeenCalled();
    });

    it('should fetch author from repository and cache it when no cache available', async () => {
      cacheService.get.mockResolvedValue(null);
      authorRepository.getById.mockResolvedValue(mockAuthor);

      const result = await authorService.getById('author-id');

      expect(authorRepository.getById).toHaveBeenCalledWith('author-id');
      expect(cacheService.set).toHaveBeenCalledWith(
        'cache-key',
        expect.objectContaining({
          id: 'author-id',
          name: 'John Doe',
        }),
        { EX: 60 },
      );
      expect(result?.id).toBe('author-id');
    });

    it('should return null if the author does not exist', async () => {
      cacheService.get.mockResolvedValue(null);
      authorRepository.getById.mockResolvedValue(null);

      const result = await authorService.getById('non-existent-id');

      expect(result).toBeNull();
      expect(cacheService.set).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const createDto: AuthorCreateDto = {
      name: 'New Author',
      avatar: 'new-avatar',
      birthDate: new Date('1990-01-01'),
      country: 'Canada',
      bio: 'A rising star',
    };

    it('should throw an error if the author already exists', async () => {
      authorRepository.getByName.mockResolvedValue(mockAuthor);

      await expect(authorService.create(createDto)).rejects.toThrow(
        AppError.forbidden('Author already exists'),
      );
      expect(authorRepository.getByName).toHaveBeenCalledWith('New Author');
      expect(authorRepository.create).not.toHaveBeenCalled();
    });

    it('should create a new author and return the result', async () => {
      const newAuthor = new AuthorEntity(
        'new-id',
        'New Author',
        'new-avatar',
        new Date('1990-01-01'),
        null,
        'Canada',
        'A rising star',
        new Date(),
        new Date(),
        [],
      );

      authorRepository.getByName.mockResolvedValue(null);
      authorRepository.create.mockResolvedValue(newAuthor);

      const result = await authorService.create(createDto);

      expect(authorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Author',
          avatar: 'new-avatar',
          birthDate: expect.any(Date),
          country: 'Canada',
          bio: 'A rising star',
          id: expect.any(String), // UUID is generated
        }),
      );
      expect(result.id).toBe('new-id');
      expect(result.name).toBe('New Author');
    });
  });

  describe('update', () => {
    const updateDto: AuthorUpdateDto = {
      name: 'Updated Name',
      bio: 'Updated bio',
    };

    it('should throw an error if the author does not exist', async () => {
      authorRepository.getById.mockResolvedValue(null);

      await expect(
        authorService.update('non-existent-id', updateDto),
      ).rejects.toThrow(AppError.notFound('Author not found'));
      expect(authorRepository.update).not.toHaveBeenCalled();
    });

    it('should update the author and return the id', async () => {
      authorRepository.getById.mockResolvedValue(mockAuthor);

      const result = await authorService.update('author-id', updateDto);

      expect(authorRepository.update).toHaveBeenCalledWith(
        'author-id',
        expect.objectContaining({
          name: 'Updated Name',
          bio: 'Updated bio',
          updatedAt: expect.any(Date),
        }),
      );
      expect(result).toBe('author-id');
    });
  });

  describe('delete', () => {
    it('should throw an error if the author does not exist', async () => {
      authorRepository.getById.mockResolvedValue(null);

      await expect(authorService.delete('non-existent-id')).rejects.toThrow(
        AppError.notFound('Author not found'),
      );
      expect(authorRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete the author and return the id', async () => {
      authorRepository.getById.mockResolvedValue(mockAuthor);

      const result = await authorService.delete('author-id');

      expect(authorRepository.delete).toHaveBeenCalledWith('author-id');
      expect(result).toBe('author-id');
    });
  });

  describe('getPopularAuthors', () => {
    it('should return popular authors from repository', async () => {
      authorRepository.getPopularAuthors.mockResolvedValue({
        authors: [mockAuthor],
        nextCursor: 'next-cursor',
      });

      const result = await authorService.getPopularAuthors(10);

      expect(authorRepository.getPopularAuthors).toHaveBeenCalledWith(
        10,
        undefined,
      );
      expect(result.data).toHaveLength(1);
      expect(result.limit).toBe(10);
      expect(result.nextCursor).toBe('next-cursor');
      expect(result.hasNextPage).toBe(true);
    });

    it('should handle pagination with cursor', async () => {
      authorRepository.getPopularAuthors.mockResolvedValue({
        authors: [mockAuthor],
        nextCursor: null,
      });

      const result = await authorService.getPopularAuthors(10, 'some-cursor');

      expect(authorRepository.getPopularAuthors).toHaveBeenCalledWith(
        10,
        'some-cursor',
      );
      expect(result.hasNextPage).toBe(false);
      expect(result.nextCursor).toBe('');
    });
  });
});
