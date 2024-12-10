import { AuthRouter } from '@src/features/auth/presentation/routes/auth-routes';
import { AuthorRouter } from '@src/features/author/presentation/routes/author-routes';
import { BookRouter } from '@src/features/book/presentation/routes/book-routes';
import { CategoryRouter } from '@src/features/category/presentation/routes/category-routes';
import { GenreRouter } from '@src/features/genre/presentation/routes/genre-routes';
import { PublisherRouter } from '@src/features/publisher/presentation/routes/publisher-routes';
import { SerieRouter } from '@src/features/serie/presentation/routes/serie-routes';
import { uploadRouter } from '@src/features/upload/presentation/controller/uploadthing';
import { UploadRouter } from '@src/features/upload/presentation/routes/upload-routes';
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
    router.use(GenreRouter.routes);
    router.use(SerieRouter.routes);
    router.use(BookRouter.routes);
    router.use(UploadRouter.routes);
    return router;
  }
}
