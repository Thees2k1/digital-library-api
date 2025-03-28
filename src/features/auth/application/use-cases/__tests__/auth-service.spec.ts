import { AuthService } from '../auth-service';
import { UserRepository } from '@src/features/user/domain/repository/user-repository';
import { CacheService } from '@src/core/interfaces/cache-service';
import { JwtService } from '@src/core/services/jwt-service';
import { AppError } from '@src/core/errors/custom-error';
import { mockDeep } from 'jest-mock-extended';
import argon2 from 'argon2';
import { AuthRepository } from '@src/features/auth/domain/repository/auth-repository';
import { LoginBodyDTO } from '../../dtos/login-dto';
import { UserEntity } from '@src/features/user/domain/entities/user';
import { AuthSessionSchema } from '@src/features/auth/domain/entities/auth';
import { extractJWTSignature } from '@src/core/utils/extract-jwt-signature';
import { generateCacheKey } from '@src/core/utils/generate-cache-key';
import { ZodError } from 'zod';
import {
  REFRESH_TOKEN_EXPIRES_IN,
  SESSION_LIMIT,
} from '@src/core/constants/constants';
import { create } from 'domain';
import e from 'express';

jest.mock('argon2');
jest.mock('@src/core/utils/extract-jwt-signature', () => ({
  extractJWTSignature: jest.fn().mockReturnValue('token-signature'),
}));
jest.mock('@src/core/utils/generate-cache-key', () => ({
  generateCacheKey: jest.fn().mockReturnValue('cache-key'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let authRepository: jest.Mocked<AuthRepository>;
  let cacheService: jest.Mocked<CacheService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: UserEntity = {
    id: 'user-id',
    password: 'hashed-password',
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    avatarUrl: '',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    id: 'session-id',
    userId: 'user-id',
    sessionIdentity: 'token-signature',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    device: 'Chrome',
    location: 'US',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 604800000), // 7 days
    active: true,
    isRevoked: false,
  };

  beforeEach(() => {
    userRepository = mockDeep<UserRepository>();
    authRepository = mockDeep<AuthRepository>();
    cacheService = mockDeep<CacheService>();
    jwtService = mockDeep<JwtService>();

    authService = new AuthService(
      userRepository,
      authRepository,
      cacheService,
      jwtService,
    );

    (extractJWTSignature as jest.Mock).mockReturnValue('token-signature');
    (generateCacheKey as jest.Mock).mockReturnValue('cache-key');

    // Reset mocks between tests
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginData: LoginBodyDTO = {
      email: 'test@example.com',
      password: 'password123',
      userAgent: 'Mozilla/5.0',
      ipAddress: '127.0.0.1',
      device: 'Chrome',
      location: 'US',
    };

    it('should throw an error if the user does not exist', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(
        AppError.badRequest('Invalid credentials'),
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should throw an error if the password is invalid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow(
        AppError.badRequest('Invalid credentials'),
      );
      expect(argon2.verify).toHaveBeenCalledWith(
        'hashed-password',
        'password123',
      );
    });

    it('should enforce session limit for the user', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      jwtService.verify.mockReturnValue({
        success: true,
        data: { userId: 'user-id', aud: 'Mozilla/5.0' },
      });
      jwtService.generate.mockReturnValueOnce('access-token');
      jwtService.generate.mockReturnValueOnce('refresh-token');
      authRepository.saveSession.mockResolvedValue(mockSession);

      await authService.login(loginData);

      expect(authRepository.enforceSessionLimit).toHaveBeenCalledWith(
        'user-id',
        SESSION_LIMIT,
      );
    });

    it('should return access and refresh tokens for valid credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      jwtService.verify.mockReturnValue({
        success: true,
        data: { userId: 'user-id', aud: 'Mozilla/5.0' },
      });
      jwtService.generate.mockReturnValueOnce('access-token');
      jwtService.generate.mockReturnValueOnce('refresh-token');
      authRepository.saveSession.mockResolvedValue(mockSession);

      const result = await authService.login(loginData);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      // Verify JWT generation was called correctly
      expect(jwtService.generate).toHaveBeenNthCalledWith(
        1,
        { userId: 'user-id' },
        { audience: 'Mozilla/5.0', expiresIn: '15m' },
      );
      expect(jwtService.generate).toHaveBeenNthCalledWith(
        2,
        { userId: 'user-id' },
        { audience: 'Mozilla/5.0', expiresIn: '7d' },
      );

      // Verify session was saved
      expect(authRepository.saveSession).toHaveBeenCalled();

      // Verify cache was set
      expect(cacheService.set).toHaveBeenCalledWith('cache-key', mockSession, {
        PX: REFRESH_TOKEN_EXPIRES_IN,
      });
    });

    it('should throw forbidden error when session validation fails', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      jwtService.verify.mockReturnValue({
        success: true,
        data: { userId: 'user-id', aud: 'Mozilla/5.0' },
      });
      authRepository.saveSession.mockImplementation(() => {
        throw new ZodError([
          {
            code: 'custom',
            path: ['sessionIdentity'],
            message: 'Invalid session data',
          },
        ]);
      });

      await expect(authService.login(loginData)).rejects.toThrow(
        AppError.forbidden('Invalid data'),
      );
    });
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
    };

    it('should throw an error if the email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.register(registerData)).rejects.toThrow(
        AppError.unauthorized('Email already exists'),
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should hash the password before creating the user', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      userRepository.create.mockResolvedValue({
        ...mockUser,
        password: 'hashed-password',
      });

      await authService.register(registerData);

      expect(argon2.hash).toHaveBeenCalledWith('password123');
      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        avatar: '',
        role: 'user',
      });
    });

    it('should create a new user and return the result without password', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      userRepository.create.mockResolvedValue(mockUser);

      const result = await authService.register(registerData);

      expect(result).toEqual(
        expect.objectContaining({
          id: 'user-id',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          createdAt: expect.any(Date),
        }),
      );
      // Verify password is not included in the result
      expect(result).not.toHaveProperty('password');
    });

    it('should propagate errors from user repository', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      userRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(authService.register(registerData)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('logout', () => {
    const logoutParams = {
      refreshToken: 'refresh-token',
      userAgent: 'Mozilla/5.0',
      device: 'Chrome',
    };

    it('should return empty string if the token is invalid', async () => {
      jwtService.verify.mockReturnValue({
        success: false,
        error: 'Invalid token',
      });

      const result = await authService.logout(logoutParams);

      expect(result).toBe('');
      expect(authRepository.deleteSession).not.toHaveBeenCalled();
      expect(cacheService.delete).not.toHaveBeenCalled();
    });

    it('should delete the session and cache for valid token', async () => {
      jwtService.verify.mockReturnValue({
        success: true,
        data: { userId: 'user-id' },
      });

      const result = await authService.logout(logoutParams);

      expect(result).toBe('Logout successful');
      expect(extractJWTSignature).toHaveBeenCalledWith('refresh-token');
      expect(authRepository.deleteSession).toHaveBeenCalledWith(
        'token-signature',
      );
      expect(generateCacheKey).toHaveBeenCalledWith('auth', {
        userId: 'user-id',
        userAgent: 'Mozilla/5.0',
        device: 'Chrome',
      });
      expect(cacheService.delete).toHaveBeenCalledWith('cache-key');
    });

    it('should propagate errors from dependencies', async () => {
      jwtService.verify.mockReturnValue({
        success: true,
        data: { userId: 'user-id' },
      });
      authRepository.deleteSession.mockRejectedValue(
        new Error('Repository error'),
      );

      await expect(authService.logout(logoutParams)).rejects.toThrow(
        'Repository error',
      );
    });
  });

  describe('refreshTokens', () => {
    const refreshParams = {
      refreshToken: 'refresh-token',
      userAgent: 'Mozilla/5.0',
      device: 'Chrome',
      ipAddress: '127.0.0.1',
      location: 'US',
      sessionIdentity: 'token-signature',
    };

    it('should throw an error if the refresh token is invalid', async () => {
      jwtService.verify.mockReturnValue({
        success: false,
        error: 'Invalid token',
      });

      await expect(authService.refreshTokens(refreshParams)).rejects.toThrow(
        AppError.unauthorized('Invalid token'),
      );
    });

    // it('should throw an error if the payload is null', async () => {
    //   jwtService.verify.mockReturnValue({
    //     success: true,
    //     data: null,
    //   });

    //   await expect(authService.refreshTokens(refreshParams)).rejects.toThrow(
    //     AppError.internalServer('Payload is null'),
    //   );
    // });

    it('should use cached session if available', async () => {
      jwtService.verify.mockReturnValue({
        success: true,
        data: { userId: 'user-id', aud: 'Mozilla/5.0' },
      });
      cacheService.get.mockResolvedValue(mockSession);
      jwtService.generate.mockReturnValueOnce('new-access-token');
      jwtService.generate.mockReturnValueOnce('new-refresh-token');
      authRepository.saveSession.mockResolvedValue(mockSession);

      const result = await authService.refreshTokens(refreshParams);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(authRepository.enforceSessionLimit).toHaveBeenCalledWith(
        'user-id',
        SESSION_LIMIT,
      );
      expect(authRepository.findSessionByUserDevice).not.toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalledWith('cache-key', mockSession, {
        PX: REFRESH_TOKEN_EXPIRES_IN,
      });
    });

    it('should fetch session from repository if not cached', async () => {
      jwtService.verify.mockReturnValue({
        success: true,
        data: { userId: 'user-id', aud: 'Mozilla/5.0' },
      });
      cacheService.get.mockResolvedValue(null);
      authRepository.findSessionByUserDevice.mockResolvedValue(mockSession);
      jwtService.generate.mockReturnValueOnce('new-access-token');
      jwtService.generate.mockReturnValueOnce('new-refresh-token');
      authRepository.saveSession.mockResolvedValue(mockSession);

      const result = await authService.refreshTokens(refreshParams);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(authRepository.findSessionByUserDevice).toHaveBeenCalledWith(
        'user-id',
        'Mozilla/5.0',
        'Chrome',
      );
    });

    it('should revoke session and throw error if session not found', async () => {
      jwtService.verify.mockReturnValue({
        success: true,
        data: { userId: 'user-id', aud: 'Mozilla/5.0' },
      });
      cacheService.get.mockResolvedValue(null);
      authRepository.findSessionByUserDevice.mockResolvedValue(null);

      await expect(authService.refreshTokens(refreshParams)).rejects.toThrow(
        AppError.forbidden('Invalid session'),
      );
      expect(authRepository.revokeSession).toHaveBeenCalledWith(
        'token-signature',
      );
    });

    it('should enforce session limit before generating new tokens', async () => {
      // (extractJWTSignature as jest.Mock).mockReturnValue('token-signature');
      jwtService.verify.mockReturnValue({
        success: true,
        data: { userId: 'user-id', aud: 'Mozilla/5.0' },
      });
      cacheService.get.mockResolvedValue(null);
      authRepository.findSessionByUserDevice.mockResolvedValue(mockSession);
      jwtService.generate.mockReturnValueOnce('new-access-token');
      jwtService.generate.mockReturnValueOnce('new-refresh-token');
      authRepository.saveSession.mockResolvedValue(mockSession);

      await authService.refreshTokens(refreshParams);

      expect(authRepository.enforceSessionLimit).toHaveBeenCalledWith(
        'user-id',
        SESSION_LIMIT,
      );
    });
  });
});
