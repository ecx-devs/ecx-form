import { Router } from 'express';
import { FormController } from '../controllers/FormController';
import { validate, createFormSchema, updateFormSchema, formIdParamSchema } from '../middleware/validation';

export function createFormRoutes(controller: FormController): Router {
  const router = Router();

  // POST /api/v1/forms - Create new form (Draft)
  router.post(
    '/',
    validate(createFormSchema),
    controller.createForm
  );

  // GET /api/v1/forms - List all forms
  router.get('/', controller.listForms);

  // GET /api/v1/forms/:id/admin - Get form schema + settings for Builder
  router.get(
    '/:id/admin',
    validate(formIdParamSchema),
    controller.getForm
  );

  // PUT /api/v1/forms/:id - Auto-Save endpoint
  router.put(
    '/:id',
    validate(updateFormSchema),
    controller.updateForm
  );

  // PATCH /api/v1/forms/:id/publish - Switch status to published
  router.patch(
    '/:id/publish',
    validate(formIdParamSchema),
    controller.publishForm
  );

  // DELETE /api/v1/forms/:id - Delete form
  router.delete(
    '/:id',
    validate(formIdParamSchema),
    controller.deleteForm
  );

  return router;
}

