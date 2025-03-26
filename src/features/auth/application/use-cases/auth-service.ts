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
import { RefreshResultDTO, RefreshTokenParamsDTO } from '../dtos/refresh-token';
import {
  RegisterBodyDTO,
  RegisterResultDTO,
  RegisterResultSchema,
} from '../dtos/register-dto';
import { IAuthService } from './interfaces/auth-service-interface';
import { CacheService } from '@src/core/interfaces/cache-service';
import { generateCacheKey } from '@src/core/utils/generate-cache-key';
import { extractJWTSignature } from '@src/core/utils/extract-jwt-signature';
import { AuthSession } from '../../domain/entities/auth';
import { SessionDtoSchema } from '../dtos/session-dto';
import { ZodError } from 'zod';
import { LogoutParamsDTO } from '../dtos/logout-dto';

@injectable()
export class AuthService implements IAuthService {
  private readonly userRepository: UserRepository;
  private readonly authRepository: AuthRepository;
  private readonly cacheService: CacheService;
  private readonly jwtService: JwtService;
  constructor(
    @inject(DI_TYPES.UserRepository) userRepository: UserRepository,
    @inject(DI_TYPES.AuthRepository) authRepository: AuthRepository,
    @inject(DI_TYPES.CacheService) cacheService: CacheService,
    @inject(JwtService) jwtService: JwtService,
  ) {
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.cacheService = cacheService;
    this.jwtService = jwtService;
  }

  async login({
    email,
    password,
    ...rest
  }: LoginBodyDTO): Promise<LoginResultDTO> {
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
        audience: rest.userAgent,
        expiresIn: '15m',
      });
      const refreshToken = await this.jwtService.generate(payload, {
        audience: rest.userAgent,
        expiresIn: '7d',
      });

      const sessionIdentity = extractJWTSignature(refreshToken);

      const sessionInfo: AuthSession = await this.authRepository.saveSession(
        SessionDtoSchema.parse({
          userId: user.id,
          sessionIdentity,
          ipAddress: rest.ipAddress,
          userAgent: rest.userAgent,
          device: rest.device,
          location: rest.location,
          expiration: REFRESH_TOKEN_EXPIRES_IN,
        }),
      );

      const cacheKey = generateCacheKey('auth', {
        userId: user.id,
        userAgent: rest.userAgent,
        device: rest.device,
      });

      await this.cacheService.set(cacheKey, sessionInfo, {
        PX: REFRESH_TOKEN_EXPIRES_IN,
      });
      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof ZodError) {
        throw AppError.forbidden(error.message);
      }
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

  async logout({
    refreshToken,
    userAgent,
    device,
  }: LogoutParamsDTO): Promise<string> {
    try {
      const res = this.jwtService.verify(refreshToken);
      if (!res.success) {
        return EMPTY_STRING;
      }

      const { userId } = res.data as JwtPayload;
      const sessionIdentity = extractJWTSignature(refreshToken);
      const cacheKey = generateCacheKey('auth', {
        userId: userId,
        userAgent: userAgent,
        device: device,
      });
      await this.authRepository.deleteSession(sessionIdentity);
      await this.cacheService.delete(cacheKey);
      return LOGOUT_SUCCESS;
    } catch (error) {
      throw error;
    }
  }

  async refreshTokens(
    params: RefreshTokenParamsDTO,
  ): Promise<RefreshResultDTO> {
    const res = this.jwtService.verify(params.refreshToken);
    if (!res.success) {
      throw AppError.unauthorized(res.error);
    }

    const payload = res.data as JwtPayload | undefined;

    if (!payload) {
      throw AppError.internalServer('Payload is null');
    }

    console.log('payload', payload);
    const { userId, aud } = payload;
    const cacheKey = generateCacheKey('auth', {
      userId,
      userAgent: params.userAgent,
      device: params.device,
    });

    const isCachedSession =
      await this.cacheService.get<AuthRepository>(cacheKey);

    if (isCachedSession) {
      console.log('redis hit');
      const newPayload: JwtPayload = {
        userId,
      };

      const newAccessToken = this.jwtService.generate(newPayload, {
        expiresIn: '15m',
        audience: aud,
      });
      const newRefreshToken = this.jwtService.generate(newPayload, {
        expiresIn: '7d',
        audience: aud,
      });
      const newIdentity = extractJWTSignature(newRefreshToken);

      //TODO: save new session to db
      const session = await this.authRepository.saveSession(
        SessionDtoSchema.parse({
          userId: payload.userId,
          sessionIdentity: newIdentity,
          expiration: REFRESH_TOKEN_EXPIRES_IN,
          userAgent: params.userAgent,
          device: params.device,
          ipAddress: params.ipAddress,
          location: params.location,
        }),
      );

      await this.cacheService.set(cacheKey, session, {
        PX: REFRESH_TOKEN_EXPIRES_IN,
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }

    console.log("redis miss, let's check db");

    const session = await this.authRepository.findSessionByUserDevice(
      userId,
      params.userAgent,
      params.device,
    );

    if (session === null) {
      throw AppError.forbidden('Invalid session');
    }

    const newPayload: JwtPayload = {
      userId,
    };

    const newAccessToken = this.jwtService.generate(newPayload, {
      expiresIn: '15m',
      audience: aud,
    });
    const newRefreshToken = this.jwtService.generate(newPayload, {
      expiresIn: '7d',
      audience: aud,
    });
    const newIdentity = extractJWTSignature(newRefreshToken);
    const newSession = await this.authRepository.saveSession(
      SessionDtoSchema.parse({
        userId: payload.userId,
        sessionIdentity: newIdentity,
        expiration: REFRESH_TOKEN_EXPIRES_IN,
        userAgent: params.userAgent,
        device: params.userAgent,
        ipAddress: params.ipAddress,
        location: params.location,
      }),
    );

    await this.cacheService.set(cacheKey, newSession, {
      PX: REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
