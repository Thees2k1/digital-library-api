import { AppError } from '@src/core/errors/custom-error';
import { authMiddleware } from '@src/core/middlewares/auth-middleware';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');
jest.mock('@src/core/config/config', () => ({
  config: {
    accessTokenSecret: 'test-secret',
  },
}));

describe('authMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
  });

  it('should call next with unauthorized error if no token is provided', async () => {
    await authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(AppError.unauthorized('Unauthorized'));
  });

  it('should call next with unauthorized error if token verification fails', async () => {
    if (!req.headers) {
      throw new Error('req.headers is not defined');
    }
    req.headers.authorization = 'Bearer invalid-token';
    (jwt.verify as jest.Mock).mockImplementation((_, __, callback) => {
      callback(new Error('Invalid token'), null);
    });

    await authMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(AppError.unauthorized('Unauthorized'));
  });

  it('should decode the token and attach it to req.body if token is valid', async () => {
    if (!req.headers) {
      throw new Error('req.headers is not defined');
    }
    req.headers.authorization = 'Bearer valid-token';
    const decodedToken = { userId: '12345' };
    (jwt.verify as jest.Mock).mockImplementation((_, __, callback) => {
      callback(null, decodedToken);
    });

    await authMiddleware(req as Request, res as Response, next);

    expect(req.body).toEqual(decodedToken);
    expect(next).toHaveBeenCalled();
  });

  it('should log an error if token verification fails', async () => {
    const logger = require('../../../../../core/utils/logger/logger').default;
    jest.spyOn(logger, 'error').mockImplementation(() => {});
    if (!req.headers) {
      throw new Error('req.headers is not defined');
    }
    req.headers.authorization = 'Bearer invalid-token';
    (jwt.verify as jest.Mock).mockImplementation((_, __, callback) => {
      callback(new Error('Invalid token'), null);
    });

    await authMiddleware(req as Request, res as Response, next);

    expect(logger.error).toHaveBeenCalledWith(
      'Error verifying token: ',
      expect.any(Error),
    );
  });
});
