import { AuthRouter } from '@src/features/auth/presentation/routes/auth-routes';
import { AuthorRouter } from '@src/features/author/presentation/routes/author-routes';
import { CategoryRouter } from '@src/features/category/presentation/routes/category-routes';
import { PublisherRouter } from '@src/features/publisher/presentation/routes/publisher-routes';
import { UserRouter } from '@src/features/user/presentation/routes/user-routes';
import { Router } from 'express';
import 'reflect-metadata';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    router.use(UserRouter.routes);
    router.use(AuthRouter.routes);
    router.use(AuthorRouter.routes);
    router.use(CategoryRouter.routes);
    router.use(PublisherRouter.routes);
    return router;
  }
}
