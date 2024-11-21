import { INTERFACE_TYPE } from "@src/core/constants/constants";
import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import {
  RegisterBodyDTO,
  RegisterResultDTO,
  RegisterResultSchema,
} from "../../domain/dtos/register-dto";
import { AuthUseCase } from "../../domain/use-cases/auth-use-case";
import { LoginBodyDTO, LoginResultDTO, LoginResultSchema } from "../../domain/dtos/login-dto";
import { AppError } from "@src/core/errors/custom-error";
import logger from "@src/features/shared/infrastructure/utils/logger/logger";
import { RefreshBodyDTO } from "../../domain/dtos/refresh-token";

@injectable()
export class AuthController {
  private readonly interactor: AuthUseCase;
  constructor(@inject(INTERFACE_TYPE.AuthUseCase) interactor: AuthUseCase) {
    this.interactor = interactor;
  }

  async register(
    req: Request<any,RegisterResultDTO, RegisterBodyDTO>,
    res: Response<RegisterResultDTO>,
    next: NextFunction
  ) {
    try {
      const data = req.body;
      const result = await this.interactor.register(data);
      const returnData: RegisterResultDTO =
        RegisterResultSchema.parse(result);
      res.json(returnData);
    } catch (error) {
      logger.error(error);
      if (error instanceof Error) {
        next(AppError.badRequest(error.message));
      } else {
        next(error);
      }
    }
  }

  async login(req: Request<any, any, LoginBodyDTO>, res: Response ,next: NextFunction) {
    try {
      const credentials = req.body;
      const result = await this.interactor.login(credentials);
      const verifiedResult : LoginResultDTO = LoginResultSchema.parse(result);
      
      res.cookie('refresh_token', verifiedResult.refreshToken, {
        httpOnly: true,
        secure: true, // chỉ sử dụng HTTPS
        //sameSite: 'Strict', // ngăn chặn CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày cho refresh token
      });

      res.json({
        access_token: verifiedResult.accessToken
      });

    } catch (error) {
      if (error instanceof Error) {
        next(AppError.badRequest(error.message));
      } else {
        next(error);
      }
    }
  }

  async refreshToken(req: Request<any,any,RefreshBodyDTO>, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies['refresh_token'];
      const result = await this.interactor.refreshTokens(refreshToken);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        next(AppError.unauthorized(error.message));
      } else {
        next(error);
      }
    }
  }

}
