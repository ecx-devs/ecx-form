/**
 * ECX Forms API - OpenAPI/Swagger Documentation
 * Version: 1.0.0
 */

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "ECX Forms API",
    description: `
# ECX Forms API Documentation

ECX Forms is a proprietary data collection platform designed as a Google Forms alternative.

## Authentication
Currently, the API does not require authentication. All endpoints are publicly accessible.

## ID Formats
- **Form ID**: \`ECXF\` + 4 uppercase letters (e.g., \`ECXFABCD\`)
- **Submission ID**: \`[Form ID]-\` + 4-digit sequence (e.g., \`ECXFABCD-0001\`)

## Rate Limits
No rate limits are currently enforced.
    `,
    version: "1.0.0",
    contact: {
      name: "ECX Team",
      url: "https://ecx.com.ng",
    },
  },
  servers: [
    {
      url: "http://localhost:3001/api/v1",
      description: "Development server",
    },
    {
      url: "https://api.forms.ecx.com.ng/api/v1",
      description: "Production server",
    },
  ],
  tags: [
    {
      name: "Forms",
      description: "Form management endpoints (Admin)",
    },
    {
      name: "Public",
      description: "Public form access and submission",
    },
    {
      name: "Submissions",
      description: "Response management and export",
    },
    {
      name: "Upload",
      description: "File upload handling",
    },
  ],
  paths: {
    "/forms": {
      post: {
        tags: ["Forms"],
        summary: "Create a new form",
        description:
          "Creates a new form in draft status. Returns the form with generated ECXF ID.",
        operationId: "createForm",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateFormInput",
              },
              example: {
                title: "Event Registration Form",
                description: "Register for ECX 6.0 events",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Form created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
                example: {
                  success: true,
                  data: {
                    id: "ECXFABCD",
                    title: "Event Registration Form",
                    description: "Register for ECX 6.0 events",
                    questions: [],
                    settings: {
                      limitToOneResponse: false,
                      allowResponseEditing: false,
                      confirmationMessage: "Your response has been recorded.",
                      showProgressBar: true,
                      shuffleQuestions: false,
                    },
                    status: "draft",
                    createdAt: "2026-01-26T10:00:00.000Z",
                    updatedAt: "2026-01-26T10:00:00.000Z",
                  },
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
        },
      },
      get: {
        tags: ["Forms"],
        summary: "List all forms",
        description: "Returns a list of all forms ordered by last updated.",
        operationId: "listForms",
        responses: {
          "200": {
            description: "List of forms",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
                example: {
                  success: true,
                  data: [
                    {
                      id: "ECXFABCD",
                      title: "Event Registration Form",
                      description: "Register for ECX 6.0 events",
                      status: "published",
                      questionCount: 5,
                      createdAt: "2026-01-26T10:00:00.000Z",
                      updatedAt: "2026-01-26T12:00:00.000Z",
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/forms/{id}/admin": {
      get: {
        tags: ["Forms"],
        summary: "Get form for editing",
        description:
          "Returns full form schema including questions and settings for the form builder.",
        operationId: "getFormAdmin",
        parameters: [
          {
            $ref: "#/components/parameters/FormId",
          },
        ],
        responses: {
          "200": {
            description: "Form details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
              },
            },
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
        },
      },
    },
    "/forms/{id}": {
      put: {
        tags: ["Forms"],
        summary: "Update form (Auto-save)",
        description:
          "Updates form title, description, questions, or settings. Used for auto-save functionality.",
        operationId: "updateForm",
        parameters: [
          {
            $ref: "#/components/parameters/FormId",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateFormInput",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Form updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
        },
      },
      delete: {
        tags: ["Forms"],
        summary: "Delete form",
        description: "Permanently deletes a form and all its submissions.",
        operationId: "deleteForm",
        parameters: [
          {
            $ref: "#/components/parameters/FormId",
          },
        ],
        responses: {
          "204": {
            description: "Form deleted successfully",
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
        },
      },
    },
    "/forms/{id}/publish": {
      patch: {
        tags: ["Forms"],
        summary: "Publish form",
        description:
          "Changes form status from draft to published. Form must have at least one question.",
        operationId: "publishForm",
        parameters: [
          {
            $ref: "#/components/parameters/FormId",
          },
        ],
        responses: {
          "200": {
            description: "Form published successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
                example: {
                  success: true,
                  data: {
                    id: "ECXFABCD",
                    status: "published",
                    publicUrl: "/forms/ECXFABCD",
                  },
                },
              },
            },
          },
          "400": {
            description: "Cannot publish form without questions",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
        },
      },
    },
    "/forms/{id}/submissions": {
      get: {
        tags: ["Submissions"],
        summary: "List form submissions",
        description: "Returns all submissions for a form.",
        operationId: "getSubmissions",
        parameters: [
          {
            $ref: "#/components/parameters/FormId",
          },
        ],
        responses: {
          "200": {
            description: "List of submissions",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
                example: {
                  success: true,
                  data: {
                    submissions: [
                      {
                        id: "ECXFABCD-0001",
                        formId: "ECXFABCD",
                        answers: [
                          {
                            questionId: "q1",
                            value: "John Doe",
                          },
                        ],
                        submittedAt: "2026-01-26T14:30:00.000Z",
                      },
                    ],
                    total: 1,
                    formTitle: "Event Registration Form",
                  },
                },
              },
            },
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
        },
      },
    },
    "/forms/{id}/export": {
      get: {
        tags: ["Submissions"],
        summary: "Export submissions",
        description: "Exports all submissions as Excel (XLSX) or JSON file.",
        operationId: "exportSubmissions",
        parameters: [
          {
            $ref: "#/components/parameters/FormId",
          },
          {
            name: "format",
            in: "query",
            description: "Export format",
            schema: {
              type: "string",
              enum: ["xlsx", "json"],
              default: "xlsx",
            },
          },
        ],
        responses: {
          "200": {
            description: "Export file",
            content: {
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                {
                  schema: {
                    type: "string",
                    format: "binary",
                  },
                },
              "application/json": {
                schema: {
                  type: "object",
                },
              },
            },
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
        },
      },
    },
    "/public/forms/{ecx_id}": {
      get: {
        tags: ["Public"],
        summary: "Get public form",
        description:
          "Returns the public form schema for respondents. Only works for published forms.",
        operationId: "getPublicForm",
        parameters: [
          {
            name: "ecx_id",
            in: "path",
            required: true,
            description: "ECX Form ID (e.g., ECXFABCD)",
            schema: {
              type: "string",
              pattern: "^ECXF[A-Z]{4}$",
            },
          },
        ],
        responses: {
          "200": {
            description: "Public form schema",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
              },
            },
          },
          "403": {
            description: "Form is not published",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "404": {
            $ref: "#/components/responses/NotFound",
          },
        },
      },
    },
    "/public/forms/{ecx_id}/submit": {
      post: {
        tags: ["Public"],
        summary: "Submit form response",
        description:
          "Submits a response to a published form. Validates required fields and restrictions.",
        operationId: "submitForm",
        parameters: [
          {
            name: "ecx_id",
            in: "path",
            required: true,
            description: "ECX Form ID",
            schema: {
              type: "string",
              pattern: "^ECXF[A-Z]{4}$",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SubmitFormInput",
              },
              example: {
                answers: [
                  {
                    questionId: "q1",
                    value: "John Doe",
                  },
                  {
                    questionId: "q2",
                    value: ["option1", "option2"],
                  },
                ],
                metadata: {
                  localStorageKey: "user-unique-id",
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Submission successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
                example: {
                  success: true,
                  data: {
                    submissionId: "ECXFABCD-0001",
                    confirmationMessage: "Your response has been recorded.",
                    allowEditing: false,
                  },
                },
              },
            },
          },
          "400": {
            $ref: "#/components/responses/ValidationError",
          },
          "403": {
            description: "Form not published",
          },
          "409": {
            description:
              "Already submitted (when limitToOneResponse is enabled)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  error: {
                    code: "ALREADY_SUBMITTED",
                    message:
                      "You have already submitted a response to this form",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/upload/sign": {
      post: {
        tags: ["Upload"],
        summary: "Get signed upload URL",
        description:
          "Returns a signed URL for uploading files directly to storage. Max file size: 2MB.",
        operationId: "getSignedUrl",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["formId", "filename", "contentType", "fileSize"],
                properties: {
                  formId: {
                    type: "string",
                    pattern: "^ECXF[A-Z]{4}$",
                    description: "Form ID",
                  },
                  filename: {
                    type: "string",
                    description: "Original filename",
                  },
                  contentType: {
                    type: "string",
                    description: "MIME type of the file",
                  },
                  fileSize: {
                    type: "integer",
                    maximum: 2097152,
                    description: "File size in bytes (max 2MB)",
                  },
                },
              },
              example: {
                formId: "ECXFABCD",
                filename: "document.pdf",
                contentType: "application/pdf",
                fileSize: 1048576,
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Signed URL generated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
                example: {
                  success: true,
                  data: {
                    signedUrl: "https://storage.supabase.co/...",
                    path: "ECXFABCD/1706270400000_document.pdf",
                    expiresAt: "2026-01-26T11:00:00.000Z",
                    maxSizeBytes: 2097152,
                  },
                },
              },
            },
          },
          "413": {
            description: "File too large",
          },
          "415": {
            description: "File type not allowed",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
          },
          data: {
            type: "object",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "object",
            properties: {
              code: {
                type: "string",
              },
              message: {
                type: "string",
              },
              details: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    path: {
                      type: "string",
                    },
                    message: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
      CreateFormInput: {
        type: "object",
        required: ["title"],
        properties: {
          title: {
            type: "string",
            minLength: 1,
            maxLength: 200,
            description: "Form title",
          },
          description: {
            type: "string",
            maxLength: 1000,
            description: "Form description (optional)",
          },
        },
      },
      UpdateFormInput: {
        type: "object",
        properties: {
          title: {
            type: "string",
            minLength: 1,
            maxLength: 200,
          },
          description: {
            type: "string",
            maxLength: 1000,
          },
          questions: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Question",
            },
          },
          settings: {
            $ref: "#/components/schemas/FormSettings",
          },
        },
      },
      Question: {
        type: "object",
        required: ["id", "type", "title", "required", "order"],
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          type: {
            type: "string",
            enum: [
              "short_text",
              "long_text",
              "number",
              "multiple_choice",
              "checkbox",
              "dropdown",
              "file_upload",
            ],
          },
          title: {
            type: "string",
            maxLength: 500,
          },
          description: {
            type: "string",
            maxLength: 1000,
          },
          required: {
            type: "boolean",
          },
          order: {
            type: "integer",
            minimum: 0,
          },
          options: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                },
                value: {
                  type: "string",
                },
                order: {
                  type: "integer",
                },
              },
            },
          },
          validation: {
            type: "object",
            properties: {
              rule: {
                type: "string",
                enum: ["none", "email", "number", "url", "phone"],
              },
              customPattern: {
                type: "string",
              },
              errorMessage: {
                type: "string",
              },
            },
          },
          fileConfig: {
            type: "object",
            properties: {
              maxSizeMB: {
                type: "number",
                maximum: 2,
              },
              allowedTypes: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
          },
        },
      },
      FormSettings: {
        type: "object",
        properties: {
          limitToOneResponse: {
            type: "boolean",
            description: "Limit each user to one response",
          },
          allowResponseEditing: {
            type: "boolean",
            description: "Allow users to edit their response",
          },
          confirmationMessage: {
            type: "string",
            maxLength: 500,
            description: "Message shown after submission",
          },
          showProgressBar: {
            type: "boolean",
            description: "Show progress bar at top",
          },
          shuffleQuestions: {
            type: "boolean",
            description: "Randomize question order",
          },
        },
      },
      SubmitFormInput: {
        type: "object",
        required: ["answers"],
        properties: {
          answers: {
            type: "array",
            items: {
              type: "object",
              required: ["questionId", "value"],
              properties: {
                questionId: {
                  type: "string",
                },
                value: {
                  oneOf: [
                    { type: "string" },
                    { type: "array", items: { type: "string" } },
                    { type: "null" },
                  ],
                },
                fileUrl: {
                  type: "string",
                },
              },
            },
          },
          metadata: {
            type: "object",
            properties: {
              localStorageKey: {
                type: "string",
                description: "Unique identifier for fill-once tracking",
              },
            },
          },
        },
      },
    },
    parameters: {
      FormId: {
        name: "id",
        in: "path",
        required: true,
        description: "ECX Form ID (e.g., ECXFABCD)",
        schema: {
          type: "string",
          pattern: "^ECXF[A-Z]{4}$",
        },
      },
    },
    responses: {
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              success: false,
              error: {
                code: "NOT_FOUND",
                message: "Form not found",
              },
            },
          },
        },
      },
      ValidationError: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              success: false,
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid request data",
                details: [
                  {
                    path: "body.title",
                    message: "Title is required",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
};
