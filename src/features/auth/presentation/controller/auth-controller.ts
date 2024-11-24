import {
  INTERFACE_TYPE,
  REFRESH_TOKEN,
  REFRESH_TOKEN_EXPIRES_IN,
} from "@src/core/constants/constants";
import { AppError } from "@src/core/errors/custom-error";
import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import {
  LoginBodyDTO,
  LoginResultDTO,
  LoginResultSchema,
} from "../../domain/dtos/login-dto";
import { RefreshBodyDTO } from "../../domain/dtos/refresh-token";
import {
  RegisterBodyDTO,
  RegisterResultDTO,
  RegisterResultSchema,
} from "../../domain/dtos/register-dto";
import { AuthUseCase } from "../../domain/use-cases/auth-use-case";
import { access } from "fs";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

@injectable()
export class AuthController {
  private readonly interactor: AuthUseCase;
  constructor(@inject(INTERFACE_TYPE.AuthUseCase) interactor: AuthUseCase) {
    this.interactor = interactor;
  }

  async register(
    req: Request<any, RegisterResultDTO, RegisterBodyDTO>,
    res: Response<RegisterResultDTO>,
    next: NextFunction
  ) {
    try {
      const data = req.body;
      const result = await this.interactor.register(data);
      const returnData: RegisterResultDTO = RegisterResultSchema.parse(result);
      res.json(returnData);
    } catch (error) {
      if (error instanceof Error) {
        next(AppError.badRequest(error.message));
      } else {
        next(error);
      }
    }
  }

  async login(
    req: Request<any, any, LoginBodyDTO>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const credentials = req.body;
      const result = await this.interactor.login(credentials);
      const verifiedResult: LoginResultDTO = LoginResultSchema.parse(result);

      res.cookie(REFRESH_TOKEN, verifiedResult.refreshToken, {
        httpOnly: true,
        secure: IS_PRODUCTION, // chỉ sử dụng HTTPS
        //sameSite: 'Strict', // ngăn chặn CSRF
        maxAge: REFRESH_TOKEN_EXPIRES_IN, // 7 ngày cho refresh token
      });

      res.json({
        access_token: verifiedResult.accessToken,
      });
    } catch (error) {
      if (error instanceof Error) {
        next(AppError.badRequest(error.message));
      } else {
        next(error);
      }
    }
  }

  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
     
      const refreshToken = req.cookies[REFRESH_TOKEN];
      const result = await this.interactor.refreshTokens(refreshToken);

      res.cookie(REFRESH_TOKEN, result.refreshToken, {
        httpOnly: true,
        secure: IS_PRODUCTION, // chỉ sử dụng HTTPS
        //sameSite: 'Strict', // ngăn chặn CSRF
        maxAge: REFRESH_TOKEN_EXPIRES_IN, // 7 ngày cho refresh token
      });

      res.json({access_token: result.accessToken});
    } catch (error) {
      if (error instanceof Error) {
        next(AppError.unauthorized(error.message));
      } else {
        next(error);
      }
    }
  }

  async logout(
    req: Request<any, any, RefreshBodyDTO>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const refreshToken = req.cookies[REFRESH_TOKEN];
      const result = await this.interactor.logout(refreshToken);
      res.clearCookie(REFRESH_TOKEN);
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