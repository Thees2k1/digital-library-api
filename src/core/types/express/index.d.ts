import { user_role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: user_role;
      };
    }
  }
}

export {};
