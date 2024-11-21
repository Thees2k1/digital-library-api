import { ZodError, ZodSchema } from "zod";
import { type Request, type Response, type NextFunction } from "express";

export const validate = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
         res.status(400).json({ message: error.flatten() });
         return;
      }
      if (error instanceof Error) {
        const err = error as Error & { statusCode: number };
        res.status(err.statusCode ||400).json({ message: error.message });
      }
      next(error);
    }
  };
};
