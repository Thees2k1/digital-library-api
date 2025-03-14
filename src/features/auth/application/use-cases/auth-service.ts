import {
  EMPTY_STRING,
  INVALID_CREDENTIALS,
  LOGOUT_SUCCESS,
  REFRESH_TOKEN_EXPIRES_IN,
} from '@src/core/constants/constants';
import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { JwtService } from '@src/core/services/jwt-service';
import { CreateUserDto } from '@src/features/user/application/dtos/user-dto';
import { UserRepository } from '@src/features/user/domain/repository/user-repository';
import argon2 from 'argon2';
import { inject, injectable } from 'inversify';
import { JwtPayload } from 'jsonwebtoken';
import { AuthRepository } from '../../domain/repository/auth-repository';
import { LoginBodyDTO, LoginResultDTO } from '../dtos/login-dto';
import { RefreshResultDTO } from '../dtos/refresh-token';
import {
  RegisterBodyDTO,
  RegisterResultDTO,
  RegisterResultSchema,
} from '../dtos/register-dto';
import { IAuthService } from './interfaces/auth-service-interface';
import { CacheService } from '@src/core/interfaces/cache-service';
import { generateCacheKey } from '@src/core/utils/generate-cache-key';
//import { RedisService } from "@src/features/shared/infrastructure/services/redis-service";

@injectable()
export class AuthService implements IAuthService {
  private readonly userRepository: UserRepository;
  private readonly authRepository: AuthRepository;
  private readonly cacheService: CacheService;
  private readonly jwtService: JwtService;
  // private readonly redisService : RedisService;
  constructor(
    @inject(DI_TYPES.UserRepository) userRepository: UserRepository,
    @inject(DI_TYPES.AuthRepository) authRepository: AuthRepository,
    @inject(DI_TYPES.CacheService) cacheService: CacheService,
    @inject(JwtService) jwtService: JwtService,
    //@inject(RedisService) redisService,
  ) {
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.cacheService = cacheService;
    this.jwtService = jwtService;
  }

  verifySession(refreshToken: string): Promise<boolean> {
    const res = this.jwtService.verify(refreshToken);
    return Promise.resolve(res.success);
  }

  async login(data: LoginBodyDTO): Promise<LoginResultDTO> {
    const { email, password } = data;
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw AppError.badRequest(INVALID_CREDENTIALS);
      }
      const isPasswordValid = await argon2.verify(user.password, password);

      if (!isPasswordValid) {
        throw AppError.badRequest(INVALID_CREDENTIALS);
      }

      const payload: JwtPayload = {
        userId: user.id,
      };
      const accessToken = await this.jwtService.generate(payload, {
        audience: data.userAgent,
        expiresIn: '15m',
      });
      const refreshToken = await this.jwtService.generate(payload, {
        audience: data.userAgent,
        expiresIn: '7d',
      });

      const sessionIdentity = refreshToken.split('.')[2];

      await this.authRepository.saveSession({
        userId: user.id,
        sessionIdentity,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        expiration: REFRESH_TOKEN_EXPIRES_IN,
      });

      const cacheKey = generateCacheKey('auth', { userId: user.id });

      await this.cacheService.set(cacheKey, sessionIdentity, {
        PX: REFRESH_TOKEN_EXPIRES_IN,
      });

      console.log('cached session', cacheKey);

      return { accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  async register(data: RegisterBodyDTO): Promise<RegisterResultDTO> {
    try {
      const existedUser = await this.userRepository.findByEmail(data.email);
      if (existedUser) {
        throw AppError.unauthorized('Email already exists');
      }
      const hashedPassword = await argon2.hash(data.password);

      const input: CreateUserDto = {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: '',
        role: data.role,
      };

      const user = await this.userRepository.create(input);

      return RegisterResultSchema.parse(user);
    } catch (error) {
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<string> {
    try {
      const res = this.jwtService.verify(refreshToken);
      if (!res.success) {
        return EMPTY_STRING;
      }
      const userId = (res.data as JwtPayload).userId;
      const sessionIdentity = refreshToken.split('.')[2];
      const cacheKey = generateCacheKey('auth', { userId });
      await this.cacheService.delete(cacheKey);
      await this.authRepository.deleteSession(sessionIdentity);
      return LOGOUT_SUCCESS;
    } catch (error) {
      throw error;
    }
  }

  async refreshTokens(refreshToken: string): Promise<RefreshResultDTO> {
    const res = this.jwtService.verify(refreshToken);
    if (!res.success) {
      throw AppError.unauthorized(res.error);
    }
    const cacheKey = generateCacheKey('auth', {
      userId: (res.data as JwtPayload).userId,
    });

    const sessionIdentity = refreshToken.split('.')[2];

    const isCachedSession = await this.cacheService.get<string>(cacheKey);

    if (isCachedSession !== sessionIdentity) {
      const session = await this.authRepository.verifySession(
        refreshToken.split('.')[2],
      );

      if (session === 'invalid') {
        throw AppError.unauthorized('Invalid session');
      }
    }

    const payload = res.data as JwtPayload | undefined;

    if (!payload) {
      throw AppError.internalServer('Payload is null');
    }

    const newPayload: JwtPayload = {
      userId: payload.userId,
    };

    const newAccessToken = this.jwtService.generate(newPayload, {
      expiresIn: '15m',
      audience: payload.aud,
    });
    const newRefreshToken = this.jwtService.generate(newPayload, {
      expiresIn: '7d',
      audience: payload.aud,
    });

    const newIdentity = newRefreshToken.split('.')[2];

    await this.authRepository.saveSession({
      userId: payload.userId,
      sessionIdentity: newIdentity,
      expiration: REFRESH_TOKEN_EXPIRES_IN,
    });

    await this.cacheService.set(cacheKey, newIdentity, {
      PX: REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
