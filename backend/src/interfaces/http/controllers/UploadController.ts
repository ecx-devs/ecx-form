import { Request, Response, NextFunction } from 'express';
import { FileUploadService } from '../../../infrastructure/services/FileUploadService';

export class UploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  getSignedUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { formId, filename, contentType, fileSize } = req.body;

      // Check file size
      const maxSize = this.fileUploadService.getMaxFileSizeBytes();
      if (fileSize > maxSize) {
        res.status(413).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
          },
        });
        return;
      }

      const result = await this.fileUploadService.getSignedUploadUrl(
        formId,
        filename,
        contentType
      );

      res.json({
        success: true,
        data: {
          signedUrl: result.signedUrl,
          path: result.path,
          expiresAt: result.expiresAt.toISOString(),
          maxSizeBytes: maxSize,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getPublicUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { path } = req.query;

      if (!path || typeof path !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PATH',
            message: 'File path is required',
          },
        });
        return;
      }

      const publicUrl = await this.fileUploadService.getPublicUrl(path);

      res.json({
        success: true,
        data: {
          url: publicUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

