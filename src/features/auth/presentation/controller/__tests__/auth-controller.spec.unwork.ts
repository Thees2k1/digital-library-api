// import { AuthController } from '../auth-controller';
// import { IAuthService } from '../../../application/use-cases/interfaces/auth-service-interface';
// import { mockDeep } from 'jest-mock-extended';
// import { Request, Response, NextFunction } from 'express';
// import { AppError } from '@src/core/errors/custom-error';
// import { getDeviceInfo } from '@src/core/utils/get-device-info';

// describe('AuthController', () => {
//   let controller: AuthController;
//   let authService: jest.Mocked<IAuthService>;
//   let req: Partial<Request>;
//   let res: Partial<Response>;
//   let next: jest.MockedFunction<NextFunction>;

//   beforeEach(() => {
//     authService = mockDeep<IAuthService>();
//     controller = new AuthController(authService);

//     req = {
//       body: {},
//       cookies: {},
//     };
//     res = {
//       json: jest.fn(),
//       cookie: jest.fn(),
//       clearCookie: jest.fn(),
//     };
//     next = jest.fn();
//   });

//   describe('register', () => {
//     it('should register a user and return the result', async () => {
//       const registerData = {
//         email: 'test@example.com',
//         password: 'password123',
//         firstName: 'John',
//         lastName: 'Doe',
//         role: 'user',
//       };
//       const registerResult = {
//         id: 'user-id',
//         email: 'test@example.com',
//         firstName: 'John',
//         lastName: 'Doe',
//         role: 'user',
//       };

//       req.body = registerData;
//       (authService.register as jest.Mock).mockResolvedValue(registerResult);

//       await controller.register(req as Request, res as Response, next);

//       expect(authService.register).toHaveBeenCalledWith(registerData);
//       expect(res.json).toHaveBeenCalledWith(registerResult);
//     });

//     it('should handle errors during registration', async () => {
//       const error = new Error('Registration failed');
//       authService.register.mockRejectedValue(error);

//       await controller.register(req as Request, res as Response, next);

//       expect(next).toHaveBeenCalledWith(AppError.badRequest(error.message));
//     });
//   });

//   describe('login', () => {
//     it('should log in a user and return tokens', async () => {
//       const loginData = {
//         email: 'test@example.com',
//         password: 'password123',
//       };
//       const loginResult = {
//         accessToken: 'access-token',
//         refreshToken: 'refresh-token',
//       };

//       (getDeviceInfo as jest.Mock).mockReturnValue({
//         ip: 'ip-adress',
//         userAgent: 'user-agent',
//         device: 'device',
//         location: 'VN',
//       });

//       req.body = loginData;
//       authService.login.mockResolvedValue(loginResult);

//       await controller.login(req as Request, res as Response, next);

//       expect(authService.login).toHaveBeenCalledWith(
//         expect.objectContaining({
//           ...loginData,
//           ipAddress: 'ip-adress',
//           userAgent: 'user-agent',
//           device: 'device',
//           location: 'VN',
//         }),
//       );
//       expect(res.cookie).toHaveBeenCalledWith(
//         'refreshToken',
//         'refresh-token',
//         expect.any(Object),
//       );
//       expect(res.json).toHaveBeenCalledWith(loginResult);
//     });

//     it('should handle errors during login', async () => {
//       const error = new Error('Login failed');
//       authService.login.mockRejectedValue(error);

//       await controller.login(req as Request, res as Response, next);

//       expect(next).toHaveBeenCalledWith(error);
//     });
//   });

//   describe('refreshToken', () => {
//     it('should refresh tokens and return new tokens', async () => {
//       const refreshToken = 'refresh-token';
//       const refreshResult = {
//         accessToken: 'new-access-token',
//         refreshToken: 'new-refresh-token',
//       };

//       req.cookies = { refreshToken };
//       authService.refreshTokens.mockResolvedValue(refreshResult);

//       await controller.refreshToken(req as Request, res as Response, next);

//       expect(authService.refreshTokens).toHaveBeenCalledWith(
//         expect.objectContaining({ refreshToken }),
//       );
//       expect(res.cookie).toHaveBeenCalledWith(
//         'refreshToken',
//         'new-refresh-token',
//         expect.any(Object),
//       );
//       expect(res.json).toHaveBeenCalledWith(refreshResult);
//     });

//     it('should handle missing refresh token', async () => {
//       req.cookies = {};

//       await controller.refreshToken(req as Request, res as Response, next);

//       expect(next).toHaveBeenCalledWith(
//         AppError.badRequest('Missing refresh token'),
//       );
//     });

//     it('should handle errors during token refresh', async () => {
//       const error = new Error('Refresh failed');
//       authService.refreshTokens.mockRejectedValue(error);

//       await controller.refreshToken(req as Request, res as Response, next);

//       expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
//       expect(next).toHaveBeenCalledWith(AppError.unauthorized(error.message));
//     });
//   });

//   describe('logout', () => {
//     it('should log out a user and clear cookies', async () => {
//       const logoutResult = 'Logout successful';
//       const refreshToken = 'refresh-token';

//       req.cookies = { refreshToken };
//       authService.logout.mockResolvedValue(logoutResult);

//       await controller.logout(req as Request, res as Response, next);

//       expect(authService.logout).toHaveBeenCalledWith(
//         expect.objectContaining({ refreshToken }),
//       );
//       expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
//       expect(res.json).toHaveBeenCalledWith(logoutResult);
//     });

//     it('should handle errors during logout', async () => {
//       const error = new Error('Logout failed');
//       authService.logout.mockRejectedValue(error);

//       await controller.logout(req as Request, res as Response, next);

//       expect(next).toHaveBeenCalledWith(AppError.unauthorized(error.message));
//     });
//   });
// });
