import {
  INTERFACE_TYPE,
  INVALID_CREDENTIALS,
  REFRESH_TOKEN_EXPIRES_IN,
} from "@src/core/constants/constants";
import { AppError } from "@src/core/errors/custom-error";
import { TokenData } from "@src/features/shared/domain/interfaces/token-data";
import { JwtService } from "@src/features/shared/infrastructure/services/jwt-service";
import { UserRepository } from "@src/features/user/domain/repository/user-repository";
import { inject, injectable } from "inversify";
import { LoginBodyDTO, LoginResultDTO } from "../../domain/dtos/login-dto";
import { RefreshResultDTO } from "../../domain/dtos/refresh-token";
import {
  RegisterBodyDTO,
  RegisterResultDTO,
  RegisterResultSchema,
} from "../../domain/dtos/register-dto";
import { AuthRepository } from "../../domain/repository/auth-repository";
import { AuthUseCase } from "../../domain/use-cases/auth-use-case";
import argon2 from "argon2";

@injectable()
export class AuthInteractor implements AuthUseCase {
  private readonly userRepository: UserRepository;
  private readonly authRepository: AuthRepository;
  private readonly JwtService;
  constructor(
    @inject(INTERFACE_TYPE.UserRepository) userRepository: UserRepository,
    @inject(INTERFACE_TYPE.AuthRepository) authRepository: AuthRepository,
    @inject(JwtService) JwtService: JwtService
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

      const Result: TokenData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName ?? undefined,
      };

      const accessToken = await this.JwtService.generate(Result, "15m");
      const refreshToken = await this.JwtService.generate(Result, "7d");

      const sessionIdentity = refreshToken.split(".")[2];

      await this.authRepository.saveSession({
        userId: user.id,
        sessionIdentity,
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
        throw AppError.unauthorized("Email already exists");
      }
      const hashedPassword = await argon2.hash(data.password);
      const user = await this.userRepository.create({
        ...data,
        password: hashedPassword,
      });

      return RegisterResultSchema.parse(user);
    } catch (error) {
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<string> {
    try {
      const res = this.JwtService.verify(refreshToken);
      if (!res.success) {
        throw AppError.unauthorized(res.error);
      }
      const sessionIdentity = refreshToken.split(".")[2];
      await this.authRepository.deleteSession(sessionIdentity);
      return "Logout success";
    } catch (error) {
      throw error;
    }
  }

  async refreshTokens(refreshToken: string): Promise<RefreshResultDTO> {
    const res = this.JwtService.verify(refreshToken);

    if (!res.success) {
      throw AppError.unauthorized(res.error);
    }

    const resData = res.data as TokenData;
    const Result: TokenData = {
      id: resData.id,
      email: resData.email,
      firstName: resData.firstName,
      lastName: resData.lastName,
    };

    const newAccessToken = this.JwtService.generate(Result, "15m");
    const newRefreshToken = this.JwtService.generate(Result, "7d");

    const sessionIdentity = newRefreshToken.split(".")[2];

    await this.authRepository.saveSession({
      userId: resData.id,
      sessionIdentity,
      expiration: REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
