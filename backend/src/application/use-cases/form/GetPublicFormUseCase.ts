import { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { FormId } from '../../../domain/value-objects/FormId';
import { PublicFormDTO } from '../../dto/FormDTO';
import { NotFoundError } from './GetFormUseCase';

export class GetPublicFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(ecxId: string): Promise<PublicFormDTO> {
    const id = FormId.fromString(ecxId);
    const form = await this.formRepository.findById(id);
    
    if (!form) {
      throw new NotFoundError(`Form not found`);
    }

    if (!form.isPublished) {
      throw new FormNotPublishedError(`This form is not available`);
    }

    const json = form.toJSON();
    
    return {
      id: json.id,
      title: json.title,
      description: json.description,
      questions: json.questions,
      settings: {
        limitToOneResponse: json.settings.limitToOneResponse,
        allowResponseEditing: json.settings.allowResponseEditing,
        showProgressBar: json.settings.showProgressBar,
      },
    };
  }
}

export class FormNotPublishedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FormNotPublishedError';
  }
}

