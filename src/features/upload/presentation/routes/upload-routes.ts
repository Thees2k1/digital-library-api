import { Router } from 'express';
import { createRouteHandler } from 'uploadthing/express';
import { uploadRouter } from '../controller/uploadthing';
import { config } from '@src/core/config/config';
import { authMiddleware } from '@src/core/middlewares/auth-middleware';

export class UploadRouter {
  static get routes(): Router {
    const path = '/upload';
    const router = Router();

    router.use(
      path,
      authMiddleware,
      createRouteHandler({
        router: uploadRouter,
        config: { token: config.uploadthingToken },
      }),
    );

    return router;
  }
}
