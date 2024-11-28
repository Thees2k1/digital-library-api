import { config } from '@src/core/config/config';
import { AppError } from '@src/core/errors/custom-error';
import { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../../../../core/utils/logger/logger';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    next(AppError.unauthorized('Unauthorized'));
    return;
  }
  jwt.verify(token, config.accessTokenSecret, (error, decoded) => {
    if (error) {
      logger.error('Error verifying token: ', error);
      next(AppError.unauthorized('Unauthorized'));
      return;
    }
    req.body = decoded;
  });

  next();
};
