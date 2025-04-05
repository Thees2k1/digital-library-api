import { AppError } from '@src/core/errors/custom-error';
import { type Request, type Response, type NextFunction } from 'express';

export const authorizeRole = (...allowedRoles: Array<'admin' | 'user'>) => {
  return (req: Request, _: Response, next: NextFunction) => {
    const { role } = req.user || {};
    if (!role) {
      return next(AppError.unauthorized('Unauthorized'));
    }
    if (!allowedRoles.includes(role)) {
      return next(
        AppError.forbidden(
          'You do not have permission to access this resource',
        ),
      );
    }
    next();
  };
};
