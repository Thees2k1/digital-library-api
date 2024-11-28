import { AuthRouter } from "@src/features/auth/presentation/routes/auth-routes";
import { UserRouter } from "@src/features/user/presentation/routes/user-routes";
import { Router } from "express";
import 'reflect-metadata';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    router.use(UserRouter.routes);
    router.use(AuthRouter.routes);
    return router;
  }
}
