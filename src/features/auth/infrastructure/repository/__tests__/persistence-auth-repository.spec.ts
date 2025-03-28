import { calculateExpiryDate } from '@src/core/utils/calculate-expiry-date';
import { PersistenceAuthRepository } from '../persitence-auth-repository';
import { PrismaClient, UserSession } from '@prisma/client';
import { SessionDTO } from '@src/features/auth/application/dtos/session-dto';
import { AuthSession } from '@src/features/auth/domain/entities/auth';
import { mockDeep } from 'jest-mock-extended';
import { sign } from 'crypto';

describe('PersistenceAuthRepository', () => {
  let repository: PersistenceAuthRepository;
  let prisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    repository = new PersistenceAuthRepository(prisma);
  });

  describe('saveSession', () => {
    it('should save a session and return the saved session', async () => {
      const sessionData: SessionDTO = {
        userId: 'user-id',
        sessionIdentity: 'session-signature',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        device: 'Chrome',
        location: 'US',
        expiration: 3600,
      };

      const savedSession: UserSession = {
        id: 'session-id',
        userId: 'user-id',
        signature: 'session-signature',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        device: 'Chrome',
        location: 'US',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: calculateExpiryDate(3600),
        active: true,
        isRevoked: false,
      };

      const repoResult: AuthSession = {
        id: savedSession.id,
        userId: savedSession.userId,
        ipAddress: savedSession.ipAddress,
        userAgent: savedSession.userAgent,
        device: savedSession.device,
        location: savedSession.location ?? '',
        sessionIdentity: savedSession.signature,
        active: savedSession.active,
        isRevoked: savedSession.isRevoked,
        expiresAt: savedSession.expiresAt,
        createdAt: savedSession.createdAt,
      };

      (prisma.userSession.upsert as jest.Mock).mockResolvedValue(savedSession);

      const result = await repository.saveSession(sessionData);

      expect(prisma.userSession.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_userAgent_device: {
              userId: 'user-id',
              userAgent: 'Mozilla/5.0',
              device: 'Chrome',
            },
          },
          create: expect.objectContaining({
            userId: 'user-id',
            signature: 'session-signature',
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
            device: 'Chrome',
            location: 'US',
            expiresAt: expect.any(Date),
          }),
          update: expect.objectContaining({
            location: 'US',
            signature: 'session-signature',
            ipAddress: '127.0.0.1',
            expiresAt: expect.any(Date),
          }),
        }),
      );

      expect(result).toEqual(repoResult);
    });
  });

  describe('deleteSession', () => {
    it('should delete a session and return the session identity', async () => {
      (prisma.userSession.delete as jest.Mock).mockResolvedValue({
        id: 'session-id',
        userId: 'user-id',
        signature: 'session-signature',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        device: 'Chrome',
        location: 'US',
        expiresAt: new Date(),
        active: false,
        isRevoked: true,
      });

      const result = await repository.deleteSession('session-signature');

      expect(prisma.userSession.delete).toHaveBeenCalledWith({
        where: { signature: 'session-signature' },
      });

      expect(result).toBe('session-signature');
    });

    it('should throw an error if the session does not exist', async () => {
      (prisma.userSession.delete as jest.Mock).mockRejectedValue(
        new Error('Session not found'),
      );

      await expect(
        repository.deleteSession('invalid-signature'),
      ).rejects.toThrow('Session not found');

      expect(prisma.userSession.delete).toHaveBeenCalledWith({
        where: { signature: 'invalid-signature' },
      });
    });
  });
});
