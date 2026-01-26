import { Form } from '../../../domain/entities/Form';
import { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { FormId } from '../../../domain/value-objects/FormId';
import { FormResponseDTO } from '../../dto/FormDTO';
import { NotFoundError } from './GetFormUseCase';

export class PublishFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(formId: string): Promise<FormResponseDTO> {
    const id = FormId.fromString(formId);
    const form = await this.formRepository.findById(id);
    
    if (!form) {
      throw new NotFoundError(`Form with ID ${formId} not found`);
    }

    form.publish();
    
    const updatedForm = await this.formRepository.update(form);
    
    return this.toResponse(updatedForm);
  }

  private toResponse(form: Form): FormResponseDTO {
    const json = form.toJSON();
    return {
      id: json.id,
      title: json.title,
      description: json.description,
      questions: json.questions,
      settings: json.settings.toJSON ? json.settings.toJSON() : json.settings,
      status: json.status,
      createdAt: json.createdAt.toISOString(),
      updatedAt: json.updatedAt.toISOString(),
      publicUrl: form.publicUrl || undefined,
    };
  }
}

