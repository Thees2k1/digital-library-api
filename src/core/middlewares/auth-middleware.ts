import { config } from '@src/core/config/config';
import { AppError } from '@src/core/errors/custom-error';
import { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger/logger';

export const authMiddleware = async (
  req: Request,
  _: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    logger.error('Token not found');
    next(AppError.unauthorized('Unauthorized'));
    return;
  }
  jwt.verify(token, config.accessTokenSecret, (error, decoded) => {
    if (error) {
      logger.error('Error verifying token: ', error);
      next(AppError.unauthorized('Unauthorized'));
      return;
    }
    if (!decoded) {
      logger.error('Token not found');
      next(AppError.unauthorized('Unauthorized'));
      return;
    }
    const payload = decoded as { userId: string; role: string };
    const user = {
      id: payload.userId,
      role: payload.role,
    };

    req.user = user;
  });

  next();
};
