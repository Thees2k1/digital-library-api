// import request from 'supertest';
// import { Request, Response, NextFunction } from 'express';
// import { AuthRouterFactory } from '../auth-routes';
// import { AuthController } from '../../controller/auth-controller';
// import { validationMiddleware } from '@src/core/middlewares/validation-middleware';
// import { container } from '@src/core/di/container';
// import { DI_TYPES } from '@src/core/di/types';
// import express, { Express } from 'express';

// jest.mock('@src/core/di/container');
// jest.mock('../../controller/auth-controller');
// jest.mock('@src/core/middlewares/validation-middleware');

// describe('AuthRouter', () => {
//   let app: Express;
//   let authController: jest.Mocked<AuthController>;

//   beforeEach(() => {
//     authController = {
//       register: jest.fn(),
//       login: jest.fn(),
//       refreshToken: jest.fn(),
//       logout: jest.fn(),
//     } as unknown as jest.Mocked<AuthController>;

//     (container.get as jest.Mock).mockImplementation((type) => {
//       if (type === DI_TYPES.AuthController) {
//         return authController;
//       }
//     });

//     const authRouterFactory = new AuthRouterFactory(
//       authController as unknown as AuthController,
//     );
//     jest.mock('@src/core/middlewares/validation-middleware', () => ({
//       validationMiddleware: jest.fn(
//         () => (req: Request, res: Response, next: NextFunction) => next(),
//       ),
//     }));

//     app = express();
//     app.use(express.json());
//     app.use(authRouterFactory.routes);
//   });

//   describe('POST /register', () => {
//     it('should call the register method of the controller', async () => {
//       const registerData = {
//         email: 'test@example.com',
//         password: 'password123',
//         firstName: 'John',
//         lastName: 'Doe',
//         role: 'user',
//       };

//       (validationMiddleware as jest.Mock).mockRejectedValueOnce(registerData);

//       await request(app).post('/register').send(registerData);

//       expect(authController.register).toHaveBeenCalled();
//     });
//   });

//   describe('POST /login', () => {
//     it('should call the login method of the controller', async () => {
//       const loginData = {
//         email: 'test@example.com',
//         password: 'password123',
//       };
//       (validationMiddleware as jest.Mock).mockRejectedValueOnce(loginData);

//       await request(app).post('/login').send(loginData);

//       expect(authController.login).toHaveBeenCalled();
//     });
//   });

//   describe('POST /refresh-token', () => {
//     it('should call the refreshToken method of the controller', async () => {
//       await request(app).post('/refresh-token');

//       expect(authController.refreshToken).toHaveBeenCalled();
//     });
//   });

//   describe('POST /logout', () => {
//     it('should call the logout method of the controller', async () => {
//       await request(app).post('/logout');

//       expect(authController.logout).toHaveBeenCalled();
//     });
//   });
// });
