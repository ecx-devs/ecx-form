import { Request, Response, NextFunction } from 'express';
import {
  CreateFormUseCase,
  GetFormUseCase,
  ListFormsUseCase,
  UpdateFormUseCase,
  PublishFormUseCase,
  DeleteFormUseCase,
  GetPublicFormUseCase,
} from '../../../application/use-cases/form';
import { CreateFormDTO, UpdateFormDTO } from '../../../application/dto/FormDTO';

export class FormController {
  constructor(
    private readonly createFormUseCase: CreateFormUseCase,
    private readonly getFormUseCase: GetFormUseCase,
    private readonly listFormsUseCase: ListFormsUseCase,
    private readonly updateFormUseCase: UpdateFormUseCase,
    private readonly publishFormUseCase: PublishFormUseCase,
    private readonly deleteFormUseCase: DeleteFormUseCase,
    private readonly getPublicFormUseCase: GetPublicFormUseCase
  ) {}

  createForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateFormDTO = {
        title: req.body.title,
        description: req.body.description,
      };

      const form = await this.createFormUseCase.execute(dto);

      res.status(201).json({
        success: true,
        data: form,
      });
    } catch (error) {
      next(error);
    }
  };

  getForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const form = await this.getFormUseCase.execute(req.params.id);

      res.json({
        success: true,
        data: form,
      });
    } catch (error) {
      next(error);
    }
  };

  listForms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const forms = await this.listFormsUseCase.execute();

      res.json({
        success: true,
        data: forms,
      });
    } catch (error) {
      next(error);
    }
  };

  updateForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: UpdateFormDTO = {
        title: req.body.title,
        description: req.body.description,
        questions: req.body.questions,
        settings: req.body.settings,
      };

      const form = await this.updateFormUseCase.execute(req.params.id, dto);

      res.json({
        success: true,
        data: form,
      });
    } catch (error) {
      next(error);
    }
  };

  publishForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const form = await this.publishFormUseCase.execute(req.params.id);

      res.json({
        success: true,
        data: form,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteFormUseCase.execute(req.params.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getPublicForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const form = await this.getPublicFormUseCase.execute(req.params.ecx_id);

      res.json({
        success: true,
        data: form,
      });
    } catch (error) {
      next(error);
    }
  };
}

