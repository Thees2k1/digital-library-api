import { Request, Response, NextFunction } from 'express';
import { AppError } from '@src/core/errors/custom-error';

/**
 * Middleware cho phép admin hoặc chính user thực hiện thao tác.
 *
 * @param paramKey: tên param chứa userId, mặc định là 'id'
 */
export const allowAdminOrOwner = (paramKey: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const loggedInUser = req.user;
    const targetUserId = req.params[paramKey];

    if (!loggedInUser) {
      return next(AppError.unauthorized('Unauthorized'));
    }

    const isAdmin = loggedInUser.role === 'admin';
    const isOwner = loggedInUser.id === targetUserId;

    if (!isAdmin && !isOwner) {
      return next(AppError.forbidden('Forbidden'));
    }

    next();
  };
};
