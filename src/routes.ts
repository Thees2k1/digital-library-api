import { Router } from "express";
import { UserRoutes } from "./features/user/presentation/routes/user-routes";
import { AuthRoutes } from "./features/auth/presentation/routes/auth-routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    router.use(UserRoutes.routes);
    router.use(AuthRoutes.routes);
    return router;
  }
}
