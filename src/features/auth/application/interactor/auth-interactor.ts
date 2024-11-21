import { config } from "@src/core/config/config";
import { INTERFACE_TYPE } from "@src/core/constants/constants";
import { AppError } from "@src/core/errors/custom-error";
import { TokenData } from "@src/features/shared/domain/interfaces/token-data";
import { UserRepository } from "@src/features/user/domain/repository/user-repository";
import bcrypt from "bcrypt";
import { inject, injectable } from "inversify";
import jwt from "jsonwebtoken";
import { AuthUseCase } from "../../domain/use-cases/auth-use-case";
import { LoginBodyDTO, LoginResultDTO, LoginResultSchema } from "../../domain/dtos/login-dto";
import { RefreshResultDTO } from "../../domain/dtos/refresh-token";
import {
  RegisterBodyDTO,
  RegisterResultDTO,
  RegisterResultSchema,
} from "../../domain/dtos/register-dto";
import { AuthRepository } from "../../domain/repository/auth-repository";

@injectable()
export class AuthInteractor implements AuthUseCase {
  private readonly userRepository: UserRepository;
  private readonly authRepository: AuthRepository;
  constructor(
    @inject(INTERFACE_TYPE.UserRepository) userRepository: UserRepository,
    @inject(INTERFACE_TYPE.AuthRepository) authRepository: AuthRepository
  ) {
    this.userRepository = userRepository;
    this.authRepository = authRepository;
  }

  async login(data: LoginBodyDTO): Promise<LoginResultDTO> {
    const { email, password } = data;
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw AppError.notFound("User not found");
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw AppError.unauthorized("Invalid password");
      }

      const Result: TokenData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName ?? undefined,
      };

      const accessToken = jwt.sign(Result, config.accessTokenSecret, {
        expiresIn: "15m",
      });
      const refreshToken = jwt.sign(Result, config.refreshTokenSecret, {
        expiresIn: "7d",
      });
      //await this.authRepository.saveSession({userId:user.id,refreshToken,expiration:7*24*60*60});
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
      const hashedPassword = await bcrypt.hash(data.password, 10);
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
    await this.userRepository.deleteSession(refreshToken);
    return Promise.resolve("Logout successfully");
  }

  async refreshTokens(refreshToken: string): Promise<RefreshResultDTO> {
    const verificationRes = (await jwt.verify(
      refreshToken,
      config.refreshTokenSecret
    )) as TokenData;
    if (!verificationRes) {
      throw AppError.unauthorized("Invalid refresh token");
    }
    const Result: TokenData = {
      id: verificationRes.id,
      email: verificationRes.email,
      firstName: verificationRes.firstName,
      lastName: verificationRes.lastName,
    };

    const newAccessToken = jwt.sign(Result, config.accessTokenSecret, {
      expiresIn: "15m",
    });
    const newRefreshToken = jwt.sign(Result, config.refreshTokenSecret, {
      expiresIn: "7d",
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
