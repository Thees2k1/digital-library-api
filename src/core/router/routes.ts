import { BookRouterFactory } from '@src/features/book/presentation/routes/book-routes';

import { UserRouterFactory } from '@src/features/user/presentation/routes/user-routes';
import { Router } from 'express';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { container } from '../di/container';
import { DI_TYPES } from '../di/types';
import { SerieRouterFactory } from '@src/features/serie/presentation/routes/serie-routes';
import { PublisherRouterFactory } from '@src/features/publisher/presentation/routes/publisher-routes';
import { CategoryRouterFactory } from '@src/features/category/presentation/routes/category-routes';
import { GenreRouterFactory } from '@src/features/genre/presentation/routes/genre-routes';
import { AuthorRouterFactory } from '@src/features/author/presentation/routes/author-routes';
import { AuthRouterFactory } from '@src/features/auth/presentation/routes/auth-routes';
import { TagRouterFactory } from '@src/features/tag/presentation/routes/tag-routes';

@injectable()
export class AppRouter {
  static get routes(): Router {
    const router = Router();
    const authRouter = container.get<AuthRouterFactory>(
      DI_TYPES.AuthRouter,
    ).router;
    const userRouter = container.get<UserRouterFactory>(
      DI_TYPES.UserRouter,
    ).router;
    const authorRouter = container.get<AuthorRouterFactory>(
      DI_TYPES.AuthorRouter,
    ).router;
    const categoryRouter = container.get<CategoryRouterFactory>(
      DI_TYPES.CategoryRouter,
    ).router;
    const genreRouter = container.get<GenreRouterFactory>(
      DI_TYPES.GenreRouter,
    ).router;
    const tagRouter = container.get<TagRouterFactory>(
      DI_TYPES.TagRouter,
    ).router;
    const publisherRouter = container.get<PublisherRouterFactory>(
      DI_TYPES.PublisherRouter,
    ).router;
    const bookRouter = container.get<BookRouterFactory>(
      DI_TYPES.BookRouter,
    ).router;
    const serieRouter = container.get<SerieRouterFactory>(
      DI_TYPES.SerieRouter,
    ).router;

    router.use(authRouter);
    router.use(userRouter);
    router.use(authorRouter);
    router.use(categoryRouter);
    router.use(genreRouter);
    router.use(tagRouter);
    router.use(publisherRouter);
    router.use(bookRouter);
    router.use(serieRouter);
    return router;
  }
}
