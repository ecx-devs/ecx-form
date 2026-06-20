import { Router } from 'express';
import { SubmissionController } from '../controllers/SubmissionController';
import { validate, formIdParamSchema, exportQuerySchema } from '../middleware/validation';

export function createSubmissionRoutes(controller: SubmissionController): Router {
  const router = Router();

  // GET /api/v1/forms/:id/submissions - List responses
  router.get(
    '/:id/submissions',
    validate(formIdParamSchema),
    controller.getSubmissions
  );

  // GET /api/v1/forms/:id/export/google-sheets - Export data to Google Sheets
  router.get(
    '/:id/export/google-sheets',
    validate(formIdParamSchema),
    controller.exportSubmissionsToGoogleSheets
  );

  // GET /api/v1/forms/:id/export - Export data
  router.get(
    '/:id/export',
    validate(exportQuerySchema),
    controller.exportSubmissions
  );

  return router;
}

