import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = validated.body;
      req.query = validated.query;
      req.params = validated.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.errors.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          },
        });
        return;
      }
      next(error);
    }
  };
}

// Form validation schemas
export const createFormSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().max(1000, "Description is too long").optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

export const updateFormSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    questions: z
      .array(
        z.object({
          id: z.string(),
          type: z.enum([
            "short_text",
            "long_text",
            "number",
            "multiple_choice",
            "checkbox",
            "dropdown",
            "file_upload",
          ]),
          title: z.string().min(1).max(500),
          description: z.string().max(1000).optional(),
          required: z.boolean(),
          order: z.number().int().min(0),
          options: z
            .array(
              z.object({
                id: z.string(),
                value: z.string(),
                order: z.number().int(),
              }),
            )
            .optional(),
          validation: z
            .object({
              rule: z.enum(["none", "email", "number", "url", "phone"]),
              customPattern: z.string().optional(),
              errorMessage: z.string().optional(),
            })
            .optional(),
          fileConfig: z
            .object({
              maxSizeMB: z.number().max(2),
              allowedTypes: z.array(z.string()).optional(),
            })
            .optional(),
        }),
      )
      .optional(),
    settings: z
      .object({
        limitToOneResponse: z.boolean().optional(),
        allowResponseEditing: z.boolean().optional(),
        confirmationMessage: z.string().max(500).optional(),
        showProgressBar: z.boolean().optional(),
        shuffleQuestions: z.boolean().optional(),
      })
      .optional(),
  }),
  query: z.object({}),
  params: z.object({
    id: z.string(),
  }),
});

export const formIdParamSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    id: z.string().regex(/^ECXF[A-Z]{4}$/i, "Invalid form ID format"),
  }),
});

export const submitFormSchema = z.object({
  body: z.object({
    answers: z.array(
      z.object({
        questionId: z.string(),
        value: z.union([z.string(), z.array(z.string()), z.null()]),
        fileUrl: z.string().optional(),
      }),
    ),
    metadata: z
      .object({
        userAgent: z.string().optional(),
        ipAddress: z.string().optional(),
        localStorageKey: z.string().optional(),
      })
      .optional(),
  }),
  query: z.object({}),
  params: z.object({
    ecx_id: z.string().regex(/^ECXF[A-Z]{4}$/i, "Invalid form ID format"),
  }),
});

export const exportQuerySchema = z.object({
  body: z.object({}),
  query: z.object({
    format: z.enum(["xlsx", "json"]).optional().default("xlsx"),
  }),
  params: z.object({
    id: z.string().regex(/^ECXF[A-Z]{4}$/i, "Invalid form ID format"),
  }),
});

export const signedUrlSchema = z.object({
  body: z.object({
    formId: z.string().regex(/^ECXF[A-Z]{4}$/i, "Invalid form ID format"),
    filename: z.string().min(1).max(200),
    contentType: z.string(),
    fileSize: z
      .number()
      .int()
      .positive()
      .max(2 * 1024 * 1024, "File size exceeds 2MB limit"),
  }),
  query: z.object({}),
  params: z.object({}),
});
