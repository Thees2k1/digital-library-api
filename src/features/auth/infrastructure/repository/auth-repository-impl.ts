import { SessionDTO } from "@src/features/user/domain/dtos/session-dto";
import { AuthRepository } from "../../domain/repository/auth-repository";
import jwt from "jsonwebtoken";
import { TokenData } from "@src/features/shared/domain/interfaces/token-data";
import { config } from "@src/core/config/config";
import { createClient, RedisClientType } from "redis";
import { AppError } from "@src/core/errors/custom-error";

export class JwtAuthRepository extends AuthRepository {
  private readonly jwtService = jwt;
  private readonly jwtSecret = config.accessTokenSecret;
  private redisClient: RedisClientType | undefined;
  constructor() {
    super();
    this.initializeRedis();
  }

  private async initializeRedis() {
    this.redisClient = createClient({
      url: config.redisUrl,
    });

    this.redisClient.on("error", (err) =>
      console.error("Redis Client Error", err)
    );

    await this.redisClient.connect();
  }
  async saveSession(session: SessionDTO): Promise<string> {
    try {
      await this.redisClient!.set(
        `refreshToken:${session.userId}`,
        session.refreshToken,
        {
          EX: session.expiration, // 7 days in seconds
        }
      );
      return session.refreshToken;
    } catch (e) {
      if (e instanceof Error) {
        throw AppError.internalServer("Error saving session, err:" + e.message);
      }
      throw e;
    }
  }
  async deleteSession(refreshToken: string): Promise<boolean> {
    try {
      await this.redisClient!.del(`refreshToken:${refreshToken}`);
      return true;
    } catch (e) {
      if (e instanceof Error) {
        throw AppError.internalServer("Error delete session, err:" + e.message);
      }
      throw e;
    }
  }
  async createToken(payload: TokenData, expiresIn: string): Promise<string> {
    return this.jwtService.sign(payload, this.jwtSecret, { expiresIn });
  }
  async verifyToken(token: string) {
    return this.jwtService.verify(token, this.jwtSecret);
  }
}
