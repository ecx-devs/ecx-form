import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../../../application/use-cases/form/GetFormUseCase';
import { FormNotPublishedError } from '../../../application/use-cases/form/GetPublicFormUseCase';
import { AlreadySubmittedError, ValidationError } from '../../../application/use-cases/submission/SubmitFormUseCase';
import { FileTypeNotAllowedError, FileTooLargeError } from '../../../infrastructure/services/FileUploadService';
import { InvalidCredentialsError, SessionExpiredError } from '../../../application/use-cases/auth';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[Error] ${err.name}: ${err.message}`);
  console.error(err.stack);

  // Map domain errors to HTTP status codes
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  if (err instanceof NotFoundError) {
    statusCode = 404;
    code = 'NOT_FOUND';
  } else if (err instanceof FormNotPublishedError) {
    statusCode = 403;
    code = 'FORM_NOT_PUBLISHED';
  } else if (err instanceof AlreadySubmittedError) {
    statusCode = 409;
    code = 'ALREADY_SUBMITTED';
  } else if (err instanceof ValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  } else if (err instanceof FileTypeNotAllowedError) {
    statusCode = 415;
    code = 'FILE_TYPE_NOT_ALLOWED';
  } else if (err instanceof FileTooLargeError) {
    statusCode = 413;
    code = 'FILE_TOO_LARGE';
  } else if (err instanceof InvalidCredentialsError) {
    statusCode = 401;
    code = 'INVALID_CREDENTIALS';
  } else if (err instanceof SessionExpiredError) {
    statusCode = 401;
    code = 'SESSION_EXPIRED';
  } else if (err.name === 'SyntaxError') {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

