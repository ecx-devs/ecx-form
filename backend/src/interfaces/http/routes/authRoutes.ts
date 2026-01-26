import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
  query: z.object({}),
  params: z.object({}),
});

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  // POST /api/v1/auth/login - Login
  router.post('/login', validate(loginSchema), controller.login);

  // POST /api/v1/auth/logout - Logout
  router.post('/logout', controller.logout);

  // GET /api/v1/auth/me - Verify session and get current admin
  router.get('/me', controller.verifySession);

  return router;
}

