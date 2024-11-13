import { Router } from "express";
import { UserRoutes } from "./features/user/presentation/routes/user-routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    router.use("/users", UserRoutes.routes);
    return router;
  }
}
