import {
  INVALID_CREDENTIALS,
  REFRESH_TOKEN_EXPIRES_IN,
} from '@src/core/constants/constants';
import { AppError } from '@src/core/errors/custom-error';
import { JwtService } from '@src/core/services/jwt-service';
import { UserRepository } from '@src/features/user/domain/repository/user-repository';
import { inject, injectable } from 'inversify';
import { LoginBodyDTO, LoginResultDTO } from '../dtos/login-dto';
import { RefreshResultDTO } from '../dtos/refresh-token';
import {
  RegisterBodyDTO,
  RegisterResultDTO,
  RegisterResultSchema,
} from '../dtos/register-dto';
import { AuthRepository } from '../../domain/repository/auth-repository';
import { AuthUseCase } from '../use-cases/auth-use-case';
import argon2 from 'argon2';
import { JwtPayload } from 'jsonwebtoken';
import { CreateUserDto } from '@src/features/user/application/dtos/user-dto';
import { DI_TYPES } from '@src/core/di/types';
import logger from '@src/core/utils/logger/logger';
//import { RedisService } from "@src/features/shared/infrastructure/services/redis-service";

@injectable()
export class AuthInteractor implements AuthUseCase {
  private readonly userRepository: UserRepository;
  private readonly authRepository: AuthRepository;
  private readonly JwtService: JwtService;
  // private readonly redisService : RedisService;
  constructor(
    @inject(DI_TYPES.UserRepository) userRepository: UserRepository,
    @inject(DI_TYPES.AuthRepository) authRepository: AuthRepository,
    @inject(JwtService) JwtService: JwtService,
    //@inject(RedisService) redisService,
  ) {
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.JwtService = JwtService;
  }

  async login(data: LoginBodyDTO): Promise<LoginResultDTO> {
    const { email, password } = data;
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw AppError.unauthorized(INVALID_CREDENTIALS);
      }
      const isPasswordValid = await argon2.verify(user.password, password);

      if (!isPasswordValid) {
        throw AppError.unauthorized(INVALID_CREDENTIALS);
      }

      const payload: JwtPayload = {
        userId: user.id,
      };
      const accessToken = await this.JwtService.generate(payload, {
        audience: data.userAgent,
        expiresIn: '15m',
      });
      const refreshToken = await this.JwtService.generate(payload, {
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
      const res = this.JwtService.verify(refreshToken);
      if (!res.success) {
        throw AppError.forbidden(res.error);
      }
      const sessionIdentity = refreshToken.split('.')[2];
      await this.authRepository.deleteSession(sessionIdentity);
      return 'Logout success';
    } catch (error) {
      throw error;
    }
  }

  async refreshTokens(refreshToken: string): Promise<RefreshResultDTO> {
    const res = this.JwtService.verify(refreshToken);
    if (!res.success) {
      throw AppError.unauthorized(res.error);
    }

    const session = await this.authRepository.verifySession(
      refreshToken.split('.')[2],
    );
    const isSessionInvalid = session === 'invalid';
    if (isSessionInvalid) {
      throw AppError.unauthorized('Invalid session');
    }

    const payload = res.data as JwtPayload | undefined;

    if (!payload) {
      throw AppError.internalServer('Payload is null');
    }

    const newPayload: JwtPayload = {
      userId: payload.userId,
    };

    const newAccessToken = this.JwtService.generate(newPayload, {
      expiresIn: '15m',
      audience: payload.aud,
    });
    const newRefreshToken = this.JwtService.generate(newPayload, {
      expiresIn: '7d',
      audience: payload.aud,
    });

    const sessionIdentity = newRefreshToken.split('.')[2];

    await this.authRepository.saveSession({
      userId: payload.userId,
      sessionIdentity,
      expiration: REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
