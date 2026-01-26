import { Request, Response, NextFunction } from 'express';
import { VerifySessionUseCase, SessionExpiredError } from '../../../application/use-cases/auth';

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        name?: string;
      };
    }
  }
}

export function createAuthMiddleware(verifySessionUseCase: VerifySessionUseCase) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const token = authHeader.replace('Bearer ', '');

      try {
        const { admin } = await verifySessionUseCase.execute(token);
        req.admin = admin;
        next();
      } catch (error) {
        if (error instanceof SessionExpiredError) {
          res.status(401).json({
            success: false,
            error: {
              code: 'SESSION_EXPIRED',
              message: 'Session expired. Please log in again.',
            },
          });
          return;
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  };
}

