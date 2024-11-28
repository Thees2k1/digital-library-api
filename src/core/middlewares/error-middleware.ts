import { AppError } from '@core/errors/custom-error';
import { ValidationError } from '@core/errors/validation-error';
import { type Response, type NextFunction, type Request } from 'express';
import { StatusCodes } from 'http-status-codes';

export class ErrorMiddleware {
  public static handleError = (
    error: unknown,
    _: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    if (error && error instanceof ValidationError) {
      const { message, name, validationErrors } = error;
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.statusCode = statusCode;
      res.json({ name, message, validationErrors });
    } else if (error instanceof AppError) {
      const { message, name } = error;
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.statusCode = statusCode;
      res.json({ name, message });
    } else {
      const name = 'InternalServerError';
      const message = 'An internal server error occurred';
      const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      res.statusCode = statusCode;
      res.json({ name, message });
    }
    next();
  };
}
