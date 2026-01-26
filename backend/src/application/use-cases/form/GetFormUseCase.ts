import { Form } from '../../../domain/entities/Form';
import { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { FormId } from '../../../domain/value-objects/FormId';
import { FormResponseDTO } from '../../dto/FormDTO';

export class GetFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(formId: string): Promise<FormResponseDTO> {
    const id = FormId.fromString(formId);
    const form = await this.formRepository.findById(id);
    
    if (!form) {
      throw new NotFoundError(`Form with ID ${formId} not found`);
    }
    
    return this.toResponse(form);
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

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

