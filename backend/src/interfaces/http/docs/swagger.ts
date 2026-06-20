/**
 * ECX Forms API - Swagger/OpenAPI Documentation
 */

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "ECX Forms API",
    description: `
## ECX Forms API Documentation

ECX Forms is a proprietary data collection platform designed to replace Google Forms.

### Key Features
- Form creation and management
- Multiple question types support
- Public form submission (no login required)
- Response export (Excel/JSON)
- File upload support (max 2MB)

### ID System
| Entity | Format | Example |
|--------|--------|---------|
| Form ID | ECXF + 4 Letters | ECXFABCD |
| Submission ID | [Form ID] + - + 4 Digits | ECXFABCD-0001 |

### Authentication
Admin endpoints require authentication via Bearer token. Use the /auth/login endpoint to obtain a token.

**Default Credentials:**
- Email: \`admin@ecx.com.ng\`
- Password: \`ecx@2026!\`

Public form endpoints do not require authentication.
    `,
    version: "1.0.0",
    contact: {
      name: "ECX Team",
      url: "https://ecx.com.ng",
    },
    license: {
      name: "Proprietary",
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
      name: "Authentication",
      description: "Admin authentication endpoints",
    },
    {
      name: "Forms",
      description: "Form management endpoints (Admin - Protected)",
    },
    {
      name: "Public",
      description: "Public form access endpoints",
    },
    {
      name: "Submissions",
      description: "Form submission and response management",
    },
    {
      name: "Upload",
      description: "File upload endpoints",
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login as admin",
        description:
          "Authenticate with email and password to receive an access token.",
        operationId: "login",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "admin@ecx.com.ng",
                  },
                  password: {
                    type: "string",
                    example: "ecx@2026!",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        token: { type: "string" },
                        admin: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            email: { type: "string" },
                            name: { type: "string" },
                          },
                        },
                        expiresAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Logout",
        description: "Invalidate the current session token.",
        operationId: "logout",
        responses: {
          "200": {
            description: "Logout successful",
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current admin",
        description: "Get the currently authenticated admin information.",
        operationId: "getCurrentAdmin",
        responses: {
          "200": {
            description: "Current admin info",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        admin: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            email: { type: "string" },
                            name: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
    },
    "/forms": {
      post: {
        tags: ["Forms"],
        summary: "Create a new form",
        description:
          "Creates a new form in draft status. Returns the form with a unique ECX ID.",
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
                description: "Register for ECX 6.0 Conference",
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
                    description: "Register for ECX 6.0 Conference",
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
            $ref: "#/components/responses/BadRequest",
          },
        },
      },
      get: {
        tags: ["Forms"],
        summary: "List all forms",
        description: "Returns a list of all forms sorted by last updated date.",
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
                      description: "Register for ECX 6.0 Conference",
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
          "Returns full form data including questions and settings for the form builder.",
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
          "Updates form title, description, questions, and/or settings. Used for auto-save functionality.",
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
            $ref: "#/components/responses/BadRequest",
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
        description: "Returns all submissions for a specific form.",
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
                        submittedAt: "2026-01-26T14:00:00.000Z",
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
            description: "File download",
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
                  type: "string",
                  format: "binary",
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
          "Returns form data for public viewing. Only works for published forms.",
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
            description: "Public form data",
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
          "Submits a response to a published form. No authentication required.",
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
            $ref: "#/components/responses/BadRequest",
          },
          "403": {
            description: "Form not accepting responses",
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
          "Returns a signed URL for uploading files directly to storage. Max file size is 2MB.",
        operationId: "getSignedUploadUrl",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SignedUrlInput",
              },
              example: {
                formId: "ECXFABCD",
                filename: "resume.pdf",
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
                    path: "ECXFABCD/1706270400000_resume.pdf",
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
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your auth token",
      },
    },
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
                    path: { type: "string" },
                    message: { type: "string" },
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
            description: "Form description",
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
              $ref: "#/components/schemas/QuestionOption",
            },
          },
          validation: {
            $ref: "#/components/schemas/QuestionValidation",
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
                items: { type: "string" },
              },
            },
          },
        },
      },
      QuestionOption: {
        type: "object",
        properties: {
          id: { type: "string" },
          value: { type: "string" },
          order: { type: "integer" },
        },
      },
      QuestionValidation: {
        type: "object",
        properties: {
          rule: {
            type: "string",
            enum: ["none", "email", "number", "url", "phone"],
          },
          customPattern: { type: "string" },
          errorMessage: { type: "string" },
        },
      },
      FormSettings: {
        type: "object",
        properties: {
          limitToOneResponse: {
            type: "boolean",
            description:
              "Limit to 1 response per user (tracked via localStorage)",
          },
          allowResponseEditing: {
            type: "boolean",
            description: "Allow users to edit their response after submission",
          },
          confirmationMessage: {
            type: "string",
            maxLength: 500,
            description: "Message shown after submission",
          },
          showProgressBar: {
            type: "boolean",
            description: "Show progress bar while filling form",
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
              $ref: "#/components/schemas/SubmissionAnswer",
            },
          },
          metadata: {
            type: "object",
            properties: {
              localStorageKey: {
                type: "string",
                description: "Unique identifier for fill-once feature",
              },
            },
          },
        },
      },
      SubmissionAnswer: {
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
      SignedUrlInput: {
        type: "object",
        required: ["formId", "filename", "contentType", "fileSize"],
        properties: {
          formId: {
            type: "string",
            pattern: "^ECXF[A-Z]{4}$",
          },
          filename: {
            type: "string",
            maxLength: 200,
          },
          contentType: {
            type: "string",
          },
          fileSize: {
            type: "integer",
            maximum: 2097152,
            description: "File size in bytes (max 2MB)",
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
      BadRequest: {
        description: "Invalid request data",
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
                message: "Form with ID ECXFXXXX not found",
              },
            },
          },
        },
      },
    },
  },
};
