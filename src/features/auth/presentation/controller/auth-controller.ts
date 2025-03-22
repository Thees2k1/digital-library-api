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
import { RefreshBodyDTO } from '../../application/dtos/refresh-token';
import {
  RegisterBodyDTO,
  RegisterResultDTO,
  RegisterResultSchema,
} from '../../application/dtos/register-dto';
import { IAuthService } from '../../application/use-cases/interfaces/auth-service-interface';

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
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Get the IP address
      let ipAddress: string | undefined;
      if (ip && typeof ip === 'string') {
        ipAddress = ip;
      } else if (ip && Array.isArray(ip)) {
        ipAddress = ip[0];
      }
      const userAgent = req.headers['user-agent']; // Get the user-agent
      const result = await this.service.login({
        ...credentials,
        ipAddress,
        userAgent,
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
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies[REFRESH_TOKEN];
      const result = await this.service.refreshTokens(refreshToken);

      res.cookie(REFRESH_TOKEN, result.refreshToken, {
        httpOnly: true,
        secure: IS_PRODUCTION, // chỉ sử dụng HTTPS
        sameSite: 'none',
        //sameSite: 'Strict', // ngăn chặn CSRF
        maxAge: REFRESH_TOKEN_EXPIRES_IN, // 7 ngày cho refresh token
      });

      res.json({ accessToken: result.accessToken });
    } catch (error) {
      if (error instanceof Error) {
        next(AppError.unauthorized(error.message));
      } else {
        next(error);
      }
    }
  }

  async checkSession(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      next(AppError.notFound('Session not found'));
      return;
    }
    try {
      // Verify refresh token
      const verified = this.service.verifySession(refreshToken);
      if (!verified) {
        next(AppError.badRequest('Invalid session'));
        return;
      }

      res.status(200).json({ session: true });
      return;
    } catch (error) {
      next(AppError.badRequest('Invalid session'));
    }
  }

  async logout(
    req: Request<any, any, RefreshBodyDTO>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const refreshToken = req.cookies[REFRESH_TOKEN];
      res.clearCookie(REFRESH_TOKEN);
      const result = await this.service.logout(refreshToken);
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
