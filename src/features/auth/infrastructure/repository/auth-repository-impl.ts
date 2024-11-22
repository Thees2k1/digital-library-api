import { PrismaClient } from "@prisma/client";
import { INTERFACE_TYPE } from "@src/core/constants/constants";
import { AppError } from "@src/core/errors/custom-error";
import { SessionDTO } from "@src/features/auth/domain/dtos/session-dto";
import { calculateExpiryDate } from "@src/features/shared/infrastructure/utils/calculate-expiry-date";
import { uuidToBinary } from "@src/features/shared/infrastructure/utils/utils";
import { inject, injectable } from "inversify";
import { AuthRepository } from "../../domain/repository/auth-repository";
import { RedisService } from "@src/features/shared/infrastructure/services/redis-service";

@injectable()
export class JwtAuthRepository extends AuthRepository {

  private readonly prismaClient: PrismaClient;
  private readonly redisService: RedisService;
  constructor(@inject(INTERFACE_TYPE.PrismaClient) prismaClient: PrismaClient, @inject(RedisService) redisService: RedisService) {
    super();
    this.prismaClient = prismaClient;
    this.redisService = redisService;
  }

  async saveSession(session: SessionDTO): Promise<string> {
    const experyDate = calculateExpiryDate(session.expiration);
    try {
      const existedSession = await this.prismaClient.userSession.findUnique({
        where: {
          userId: uuidToBinary(session.userId),
        },
      });

      if (existedSession) {
        await this.prismaClient.userSession.update({
          where: {
            userId: uuidToBinary(session.userId),
          },
          data: {
            signature: session.sessionIdentity,
            expiresAt: experyDate,
          },
        });
      } else {
        await this.prismaClient.userSession.create({
          data: {
            userId: uuidToBinary(session.userId),
            signature: session.sessionIdentity,
            expiresAt: experyDate,
          },
        });
      }

      return session.sessionIdentity;
    } catch (e) {
      if (e instanceof Error) {
        throw AppError.internalServer("Error saving session, err:" + e.message);
      }
      throw e;
    }
  }

  async deleteSession(sessionIdentity: string): Promise<string> {
    try {

      await this.prismaClient.userSession.delete({
        where: {
          signature: sessionIdentity,
        },
      });

      // await this.redisClient!.del(`refreshToken:${sessionIdentity}`);
      return "delete success";
    } catch (e) {
      if (e instanceof Error) {
        throw AppError.internalServer("Error delete session, err:" + e.message);
      }
      throw e;
    }
  }
}
