import { PrismaClient } from '@prisma/client';
import { EMPTY_STRING, SUCCESSFUL } from '@src/core/constants/constants';
import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { calculateExpiryDate } from '@src/core/utils/calculate-expiry-date';
import { SessionDTO } from '@src/features/auth/application/dtos/session-dto';
import { inject, injectable } from 'inversify';
import { AuthRepository } from '../../domain/repository/auth-repository';
import { AuthSession, AuthSessionSchema } from '../../domain/entities/auth';
import { ZodError } from 'zod';
import logger from '@src/core/utils/logger/logger';

// import { RedisService } from "@src/features/shared/infrastructure/services/redis-service";

@injectable()
export class PersistenceAuthRepository extends AuthRepository {
  async findSessionByUserDevice(
    userId: string,
    userAgent: string,
    device: string,
  ): Promise<AuthSession | null> {
    try {
      const dbData = await this.prismaClient.userSession.findUnique({
        where: {
          userId_userAgent_device: {
            userId: userId,
            userAgent: userAgent,
            device: device,
          },
          isRevoked: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!dbData) {
        return null;
      }
      return AuthSessionSchema.parse(dbData);
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(error.errors);
        throw AppError.internalServer('Error parsing session data');
      } else if (error instanceof AppError) {
        throw error;
      } else {
        logger.error('Error find session by user device, err:' + error);
        throw AppError.internalServer(
          'Something went wrong while fetching session',
        );
      }
    }
  }
  async countUserSessions(userId: string): Promise<number> {
    try {
      const count = await this.prismaClient.userSession.count({
        where: {
          userId: userId,
          isRevoked: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      return count;
    } catch (error) {
      logger.error('Error count user sessions, err:' + error);
      throw AppError.internalServer(
        'Something went wrong while counting user sessions',
      );
    }
  }
  async enforceSessionLimit(userId: string, limit: number): Promise<void> {
    try {
      const count = await this.countUserSessions(userId);
      if (count >= limit) {
        throw AppError.badRequest('Session limit exceeded');
      }
    } catch (error) {
      logger.error('Error enforce session limit, err:' + error);
      throw AppError.internalServer(
        'Something went wrong while enforcing session limit',
      );
    }
  }
  async cleanupExpiredSessions(): Promise<void> {
    try {
      await this.prismaClient.userSession.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      logger.error('Error cleanup expired sessions, err:' + error);
      throw AppError.internalServer(
        'Something went wrong while cleaning up expired sessions',
      );
    }
  }
  async revokeAllSessions(userId: string): Promise<void> {
    try {
      await this.prismaClient.userSession.updateMany({
        where: {
          userId: userId,
        },
        data: {
          isRevoked: true,
        },
      });
    } catch (error) {
      logger.error('Error revoke all sessions, err:' + error);
      throw AppError.internalServer(
        'Something went wrong while revoking all sessions',
      );
    }
  }

  async revokeSession(sessionIdentity: string): Promise<void> {
    try {
      await this.prismaClient.userSession.update({
        where: {
          signature: sessionIdentity,
        },
        data: {
          isRevoked: true,
        },
      });
    } catch (error) {
      logger.error('Error revoke session, err:' + error);
      throw AppError.internalServer(
        'Something went wrong while revoking session',
      );
    }
  }
  async revokeSessions(sessionIdentities: string[]): Promise<void> {
    try {
      await this.prismaClient.userSession.updateMany({
        where: {
          signature: {
            in: sessionIdentities,
          },
        },
        data: {
          isRevoked: true,
        },
      });
    } catch (error) {
      logger.error('Error revoke sessions, err:' + error);
      throw AppError.internalServer(
        'Something went wrong while revoking sessions',
      );
    }
  }
  private readonly prismaClient: PrismaClient;

  constructor(@inject(DI_TYPES.PrismaClient) prismaClient: PrismaClient) {
    super();
    this.prismaClient = prismaClient;
  }

  async saveSession({
    userId,
    expiration,
    ipAddress,
    userAgent,
    device,
    location,
    sessionIdentity,
  }: SessionDTO): Promise<AuthSession> {
    const expiryDate = calculateExpiryDate(expiration);
    console.log('current device', {
      userId,
      expiration,
      ipAddress,
      userAgent,
      device,
      location,
      sessionIdentity,
    });
    try {
      const dbData = await this.prismaClient.userSession.upsert({
        where: {
          userId_userAgent_device: {
            userId: userId,
            userAgent: userAgent,
            device: device,
          },
        },
        update: {
          expiresAt: expiryDate,
          signature: sessionIdentity,
        },
        create: {
          userId: userId,
          expiresAt: expiryDate,
          ipAddress: ipAddress,
          userAgent: userAgent,
          device: device,
          location: location,
          signature: sessionIdentity,
        },
      });

      return AuthSessionSchema.parse({
        ...dbData,
        sessionIdentity: dbData.signature,
        location: dbData.location ?? '',
      });
    } catch (e) {
      if (e instanceof Error) {
        logger.error('Error save session, err:' + e.message);
        throw AppError.internalServer(
          'Something went wrong while saving session',
        );
      }
      throw e;
    }
  }

  async deleteSession(sessionIdentity: string): Promise<string> {
    try {
      const existed = await this.prismaClient.userSession.findUnique({
        where: { signature: sessionIdentity },
      });
      if (!existed) return EMPTY_STRING;

      await this.prismaClient.userSession.delete({
        where: {
          signature: sessionIdentity,
        },
      });
      return SUCCESSFUL;
    } catch (e) {
      if (e instanceof Error) {
        throw AppError.internalServer('Error delete session, err:' + e.message);
      }
      throw e;
    }
  }

  async findSessionByIdentity(
    sessionIdentity: string,
  ): Promise<AuthSession | null> {
    try {
      const session = await this.prismaClient.userSession.findUnique({
        where: {
          signature: sessionIdentity,
        },
      });

      if (!session) {
        return null;
      }

      return AuthSessionSchema.parse(session);
    } catch (e) {
      if (e instanceof Error) {
        throw AppError.internalServer(
          'Error find session by identity, err:' + e.message,
        );
      }
      throw e;
    }
  }
  async findSessionsByUserId(userId: string): Promise<Array<AuthSession>> {
    try {
      const sessions = await this.prismaClient.userSession.findMany({
        where: {
          userId: userId,
        },
      });

      return sessions.map((session) => AuthSessionSchema.parse(session));
    } catch (e) {
      if (e instanceof Error) {
        throw AppError.internalServer(
          'Error find sessions by user id, err:' + e.message,
        );
      }
      throw e;
    }
  }
}
