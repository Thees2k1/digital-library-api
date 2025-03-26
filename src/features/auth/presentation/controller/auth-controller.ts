import {
  REFRESH_TOKEN,
  REFRESH_TOKEN_EXPIRES_IN,
} from '@src/core/constants/constants';
import { DI_TYPES } from '@src/core/di/types';
import { AppError } from '@src/core/errors/custom-error';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import {
  LoginBodyDTO,
  LoginResultDTO,
  LoginResultSchema,
} from '../../application/dtos/login-dto';
import { RefreshTokenParamsSchema } from '../../application/dtos/refresh-token';
import {
  RegisterBodyDTO,
  RegisterResultDTO,
  RegisterResultSchema,
} from '../../application/dtos/register-dto';
import { IAuthService } from '../../application/use-cases/interfaces/auth-service-interface';
import { getDeviceInfo } from '@src/core/utils/get-device-info';
import { LogoutParamsSchema } from '../../application/dtos/logout-dto';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

@injectable()
export class AuthController {
  private readonly service: IAuthService;
  constructor(@inject(DI_TYPES.AuthService) service: IAuthService) {
    this.service = service;
  }

  async register(
    req: Request<any, RegisterResultDTO, RegisterBodyDTO>,
    res: Response<RegisterResultDTO>,
    next: NextFunction,
  ) {
    try {
      const data = req.body;
      const result = await this.service.register(data);
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
    next: NextFunction,
  ) {
    try {
      const credentials = req.body;

      const { ip, userAgent, device, location } = getDeviceInfo(req);

      const result = await this.service.login({
        ...credentials,
        ipAddress: ip,
        userAgent,
        device,
        location,
      });

      const verifiedResult: LoginResultDTO = LoginResultSchema.parse(result);

      res.cookie(REFRESH_TOKEN, verifiedResult.refreshToken, {
        httpOnly: true,
        secure: IS_PRODUCTION, // chỉ sử dụng HTTPS
        sameSite: IS_PRODUCTION ? 'none' : 'strict', // ngăn chặn CSRF
        maxAge: REFRESH_TOKEN_EXPIRES_IN, // 7 ngày cho refresh token
      });

      res.json({
        accessToken: verifiedResult.accessToken,
        refreshToken: verifiedResult.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { ip, userAgent, device, location } = getDeviceInfo(req);
      const refreshToken = req.cookies[REFRESH_TOKEN] as string | undefined;

      if (!refreshToken) {
        next(AppError.badRequest('Missing refresh token'));
        return;
      }
      const result = await this.service.refreshTokens(
        RefreshTokenParamsSchema.parse({
          refreshToken,
          ipAddress: ip,
          userAgent,
          device,
          location,
        }),
      );

      res.cookie(REFRESH_TOKEN, result.refreshToken, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'none',
        maxAge: REFRESH_TOKEN_EXPIRES_IN,
      });

      res.json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.clearCookie(REFRESH_TOKEN);
        next(AppError.unauthorized(error.message));
      } else {
        next(error);
      }
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { userAgent, device } = getDeviceInfo(req);
      res.clearCookie(REFRESH_TOKEN);
      const refreshToken = req.cookies[REFRESH_TOKEN];
      const result = await this.service.logout(
        LogoutParamsSchema.parse({
          refreshToken,
          userAgent,
          device,
        }),
      );
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
