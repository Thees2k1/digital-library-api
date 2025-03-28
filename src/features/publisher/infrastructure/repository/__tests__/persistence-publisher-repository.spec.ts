import { PrismaClient, Publisher } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { PublisherEntity } from '../../../domain/entities/publisher-entity';
import { PersistencePublisherRepository } from '../persistence-publisher-repository';

describe('PersistencePublisherRepository', () => {
  let repository: PersistencePublisherRepository;
  let prisma: jest.Mocked<PrismaClient>;

  const mockPublisher: Publisher = {
    id: 'publisher-id',
    name: 'Test Publisher',
    cover: 'cover-url.jpg',
    contactInfo: 'contact@publisher.com',
    address: 'Publisher Address',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    repository = new PersistencePublisherRepository(prisma);
  });

  describe('getList', () => {
    it('should get a list of publishers', async () => {
      (prisma.publisher.findMany as jest.Mock).mockResolvedValue([
        mockPublisher,
      ]);

      const result = await repository.getList();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(PublisherEntity);
      expect(result[0].id).toBe(mockPublisher.id);
      expect(prisma.publisher.findMany).toHaveBeenCalledWith();
    });
  });

  describe('getById', () => {
    it('should return publisher by id', async () => {
      (prisma.publisher.findUnique as jest.Mock).mockResolvedValue(
        mockPublisher,
      );

      const result = await repository.getById('publisher-id');

      expect(result).toBeInstanceOf(PublisherEntity);
      expect(result?.id).toBe(mockPublisher.id);
      expect(prisma.publisher.findUnique).toHaveBeenCalledWith({
        where: { id: 'publisher-id' },
      });
    });

    it('should return null if publisher not found', async () => {
      (prisma.publisher.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.getById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getByNameAsync', () => {
    it('should return publisher by name', async () => {
      (prisma.publisher.findFirst as jest.Mock).mockResolvedValue(
        mockPublisher,
      );

      const result = await repository.getByNameAsync('Test Publisher');

      expect(result).toBeInstanceOf(PublisherEntity);
      expect(result?.name).toBe(mockPublisher.name);
      expect(prisma.publisher.findFirst).toHaveBeenCalledWith({
        where: { name: 'Test Publisher' },
      });
    });

    it('should return null if no publisher with given name', async () => {
      (prisma.publisher.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.getByNameAsync('Non-existent Publisher');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a publisher', async () => {
      const publisherData: Partial<PublisherEntity> = {
        name: 'New Publisher',
        cover: 'new-cover.jpg',
        contactInfo: 'new@publisher.com',
        address: 'New Address',
      };

      (prisma.publisher.create as jest.Mock).mockResolvedValue({
        ...mockPublisher,
        ...publisherData,
        id: 'new-publisher-id',
      });

      const result = await repository.create(publisherData);

      expect(result).toBeInstanceOf(PublisherEntity);
      expect(result.name).toBe(publisherData.name);
      expect(prisma.publisher.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: publisherData.name,
          cover: publisherData.cover,
          contactInfo: publisherData.contactInfo,
          address: publisherData.address,
        }),
      });
    });
  });

  describe('update', () => {
    it('should update a publisher', async () => {
      const updateData: Partial<PublisherEntity> = {
        id: 'publisher-id',
        name: 'Updated Publisher',
        address: 'Updated Address',
      };

      await repository.update('publisher-id', updateData);

      expect(prisma.publisher.update).toHaveBeenCalledWith({
        where: { id: 'publisher-id' },
        data: expect.objectContaining({
          name: updateData.name,
          address: updateData.address,
        }),
      });
    });
  });

  describe('delete', () => {
    it('should delete a publisher', async () => {
      await repository.delete('publisher-id');

      expect(prisma.publisher.delete).toHaveBeenCalledWith({
        where: { id: 'publisher-id' },
      });
    });
  });
});
