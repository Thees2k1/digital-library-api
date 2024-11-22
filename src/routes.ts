import { Router } from "express";
import { UserRouter } from "./features/user/presentation/routes/user-routes";
import { AuthRouter } from "./features/auth/presentation/routes/auth-routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    router.use(UserRouter.routes);
    router.use(AuthRouter.routes);
    return router;
  }
}
