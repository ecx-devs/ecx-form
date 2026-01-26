import { Request, Response, NextFunction } from 'express';
import {
  SubmitFormUseCase,
  GetSubmissionsUseCase,
  ExportSubmissionsUseCase,
  ExportFormat,
} from '../../../application/use-cases/submission';
import { CreateSubmissionDTO } from '../../../application/dto/SubmissionDTO';

export class SubmissionController {
  constructor(
    private readonly submitFormUseCase: SubmitFormUseCase,
    private readonly getSubmissionsUseCase: GetSubmissionsUseCase,
    private readonly exportSubmissionsUseCase: ExportSubmissionsUseCase
  ) {}

  submitForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateSubmissionDTO = {
        formId: req.params.ecx_id.toUpperCase(),
        answers: req.body.answers,
        metadata: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip || req.socket.remoteAddress,
          localStorageKey: req.body.metadata?.localStorageKey,
        },
      };

      const result = await this.submitFormUseCase.execute(dto);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getSubmissionsUseCase.execute(req.params.id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  exportSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const format = (req.query.format as ExportFormat) || 'csv';
      const result = await this.exportSubmissionsUseCase.execute(req.params.id, format);

      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.send(result.data);
    } catch (error) {
      next(error);
    }
  };
}

