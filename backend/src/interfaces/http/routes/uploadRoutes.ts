import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';
import { validate, signedUrlSchema } from '../middleware/validation';

export function createUploadRoutes(controller: UploadController): Router {
  const router = Router();

  // POST /api/v1/upload/sign - Get Signed URL
  router.post(
    '/sign',
    validate(signedUrlSchema),
    controller.getSignedUrl
  );

  return router;
}

