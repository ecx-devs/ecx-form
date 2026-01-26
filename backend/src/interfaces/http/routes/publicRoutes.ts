import { Router } from 'express';
import { z } from 'zod';
import { FormController } from '../controllers/FormController';
import { SubmissionController } from '../controllers/SubmissionController';
import { validate, submitFormSchema } from '../middleware/validation';

const publicFormIdSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    ecx_id: z.string().regex(/^ECXF[A-Z]{4}$/i, 'Invalid form ID format'),
  }),
});

export function createPublicRoutes(
  formController: FormController,
  submissionController: SubmissionController
): Router {
  const router = Router();

  // GET /api/v1/public/forms/:ecx_id - Fetch public schema (if published)
  router.get(
    '/forms/:ecx_id',
    validate(publicFormIdSchema),
    formController.getPublicForm
  );

  // POST /api/v1/public/forms/:ecx_id/submit - Submit response
  router.post(
    '/forms/:ecx_id/submit',
    validate(submitFormSchema),
    submissionController.submitForm
  );

  return router;
}

