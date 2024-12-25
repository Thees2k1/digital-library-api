import { createUploadthing, FileRouter } from 'uploadthing/express';
import { z } from 'zod';

export const f = createUploadthing({
  errorFormatter: (err) => {
    return {
      message: err.message,
      zodError: err.cause instanceof z.ZodError ? err.cause.flatten() : null,
    };
  },
});

export const uploadRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    .onUploadError((error) => {
      console.log('upload error', error);
      throw error;
    })
    .onUploadComplete((data) => {
      console.log('upload completed', data);
    }),
} satisfies FileRouter;
export type UploadRouter = typeof uploadRouter;
