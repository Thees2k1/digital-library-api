import { PrismaClient } from '@prisma/client';
import { EMPTY_STRING, SUCCESSFUL } from '@src/core/constants/constants';
import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { calculateExpiryDate } from '@src/core/utils/calculate-expiry-date';
import { SessionDTO } from '@src/features/auth/application/dtos/session-dto';
import { inject, injectable } from 'inversify';
import { AuthRepository } from '../../domain/repository/auth-repository';

// import { RedisService } from "@src/features/shared/infrastructure/services/redis-service";

@injectable()
export class PersistenceAuthRepository extends AuthRepository {
  private readonly prismaClient: PrismaClient;
  // private readonly redisService: RedisService;
  constructor(
    @inject(DI_TYPES.PrismaClient) prismaClient: PrismaClient,
    // @inject(RedisService) redisService: RedisService
  ) {
    super();
    this.prismaClient = prismaClient;
    //this.redisService = redisService;
  }

  async saveSession(session: SessionDTO): Promise<string> {
    const experyDate = calculateExpiryDate(session.expiration);
    try {
      const existedSession = await this.prismaClient.userSession.findUnique({
        where: {
          userId: session.userId,
        },
      });

      if (existedSession) {
        await this.prismaClient.userSession.update({
          where: {
            userId: session.userId,
          },
          data: {
            signature: session.sessionIdentity,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            expiresAt: experyDate,
          },
        });
      } else {
        await this.prismaClient.userSession.create({
          data: {
            userId: session.userId,
            signature: session.sessionIdentity,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            expiresAt: experyDate,
          },
        });
      }

      return session.sessionIdentity;
    } catch (e) {
      if (e instanceof Error) {
        throw AppError.internalServer('Error saving session, err:' + e.message);
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

      // await this.redisClient!.del(`refreshToken:${sessionIdentity}`);
      return SUCCESSFUL;
    } catch (e) {
      if (e instanceof Error) {
        throw AppError.internalServer('Error delete session, err:' + e.message);
      }
      throw e;
    }
  }

  async verifySession(sessionIdentity: string): Promise<'valid' | 'invalid'> {
    try {
      const session = await this.prismaClient.userSession.findUnique({
        where: {
          signature: sessionIdentity,
        },
      });

      if (!session) {
        return 'invalid';
      }

      if (new Date() > session.expiresAt) {
        await this.prismaClient.userSession.delete({
          where: {
            signature: sessionIdentity,
          },
        });
        return 'invalid';
      }

      return 'valid';
    } catch (e) {
      if (e instanceof Error) {
        throw AppError.internalServer('Error verify session, err:' + e.message);
      }
      throw e;
    }
  }

  findSessionByIdentity(sessionIdentity: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  findSessionByUserId(userId: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
