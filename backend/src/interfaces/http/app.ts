import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { getSupabaseClient } from "../../infrastructure/config/supabase";
import { SupabaseFormRepository } from "../../infrastructure/repositories/SupabaseFormRepository";
import { SupabaseSubmissionRepository } from "../../infrastructure/repositories/SupabaseSubmissionRepository";
import { SupabaseAdminRepository } from "../../infrastructure/repositories/SupabaseAdminRepository";
import { FileUploadService } from "../../infrastructure/services/FileUploadService";

import {
  CreateFormUseCase,
  GetFormUseCase,
  ListFormsUseCase,
  UpdateFormUseCase,
  PublishFormUseCase,
  DeleteFormUseCase,
  GetPublicFormUseCase,
} from "../../application/use-cases/form";

import {
  SubmitFormUseCase,
  GetSubmissionsUseCase,
  ExportSubmissionsUseCase,
} from "../../application/use-cases/submission";

import {
  LoginUseCase,
  LogoutUseCase,
  VerifySessionUseCase,
} from "../../application/use-cases/auth";

import { FormController } from "./controllers/FormController";
import { SubmissionController } from "./controllers/SubmissionController";
import { UploadController } from "./controllers/UploadController";
import { AuthController } from "./controllers/AuthController";

import { createFormRoutes } from "./routes/formRoutes";
import { createPublicRoutes } from "./routes/publicRoutes";
import { createSubmissionRoutes } from "./routes/submissionRoutes";
import { createUploadRoutes } from "./routes/uploadRoutes";
import { createAuthRoutes } from "./routes/authRoutes";
import { createDocsRoutes } from "./routes/docsRoutes";
import { createAuthMiddleware } from "./middleware/authMiddleware";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp(): Application {
  const app = express();

  // Get Supabase client
  const supabase = getSupabaseClient();

  // Initialize repositories
  const formRepository = new SupabaseFormRepository(supabase);
  const submissionRepository = new SupabaseSubmissionRepository(supabase);
  const adminRepository = new SupabaseAdminRepository(supabase);

  // Initialize services
  const fileUploadService = new FileUploadService(supabase);

  // Initialize use cases
  const createFormUseCase = new CreateFormUseCase(formRepository);
  const getFormUseCase = new GetFormUseCase(formRepository);
  const listFormsUseCase = new ListFormsUseCase(formRepository);
  const updateFormUseCase = new UpdateFormUseCase(formRepository);
  const publishFormUseCase = new PublishFormUseCase(formRepository);
  const deleteFormUseCase = new DeleteFormUseCase(formRepository);
  const getPublicFormUseCase = new GetPublicFormUseCase(formRepository);

  const getSubmissionsUseCase = new GetSubmissionsUseCase(
    formRepository,
    submissionRepository,
  );
  const exportSubmissionsUseCase = new ExportSubmissionsUseCase(
    formRepository,
    submissionRepository,
  );
  const submitFormUseCase = new SubmitFormUseCase(
    formRepository,
    submissionRepository,
    exportSubmissionsUseCase,
  );

  const loginUseCase = new LoginUseCase(adminRepository);
  const logoutUseCase = new LogoutUseCase(adminRepository);
  const verifySessionUseCase = new VerifySessionUseCase(adminRepository);

  // Initialize controllers
  const formController = new FormController(
    createFormUseCase,
    getFormUseCase,
    listFormsUseCase,
    updateFormUseCase,
    publishFormUseCase,
    deleteFormUseCase,
    getPublicFormUseCase,
  );

  const submissionController = new SubmissionController(
    submitFormUseCase,
    getSubmissionsUseCase,
    exportSubmissionsUseCase,
  );

  const uploadController = new UploadController(fileUploadService);

  const authController = new AuthController(
    loginUseCase,
    logoutUseCase,
    verifySessionUseCase,
  );

  // Auth middleware
  const authMiddleware = createAuthMiddleware(verifySessionUseCase);

  // Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
      exposedHeaders: ["Content-Disposition"],
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(morgan("combined"));

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Public routes (no auth required)
  app.use("/api/v1/auth", createAuthRoutes(authController));
  app.use(
    "/api/v1/public",
    createPublicRoutes(formController, submissionController),
  );
  app.use("/api/v1/docs", createDocsRoutes());
  app.use("/api/v1/upload", createUploadRoutes(uploadController)); // File upload is public for form submissions

  // Protected routes (auth required)
  app.use("/api/v1/forms", authMiddleware, createFormRoutes(formController));
  app.use(
    "/api/v1/forms",
    authMiddleware,
    createSubmissionRoutes(submissionController),
  );

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
