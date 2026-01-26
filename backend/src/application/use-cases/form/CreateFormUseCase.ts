import { Form } from '../../../domain/entities/Form';
import { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { CreateFormDTO, FormResponseDTO } from '../../dto/FormDTO';

export class CreateFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(dto: CreateFormDTO): Promise<FormResponseDTO> {
    const form = Form.create(dto.title, dto.description);
    
    const savedForm = await this.formRepository.create(form);
    
    return this.toResponse(savedForm);
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

