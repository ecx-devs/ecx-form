import { Form } from '../../../domain/entities/Form';
import { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { FormId } from '../../../domain/value-objects/FormId';
import { UpdateFormDTO, FormResponseDTO } from '../../dto/FormDTO';
import { NotFoundError } from './GetFormUseCase';

export class UpdateFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(formId: string, dto: UpdateFormDTO): Promise<FormResponseDTO> {
    const id = FormId.fromString(formId);
    const form = await this.formRepository.findById(id);
    
    if (!form) {
      throw new NotFoundError(`Form with ID ${formId} not found`);
    }

    // Update form properties
    if (dto.title !== undefined) {
      form.updateTitle(dto.title);
    }

    if (dto.description !== undefined) {
      form.updateDescription(dto.description);
    }

    if (dto.questions !== undefined) {
      // Replace all questions (for auto-save functionality)
      this.replaceQuestions(form, dto.questions);
    }

    if (dto.settings !== undefined) {
      form.updateSettings(dto.settings);
    }

    const updatedForm = await this.formRepository.update(form);
    
    return this.toResponse(updatedForm);
  }

  private replaceQuestions(form: Form, questions: typeof form.questions): void {
    // Remove all existing questions
    const existingIds = form.questions.map(q => q.id);
    for (const id of existingIds) {
      try {
        form.removeQuestion(id);
      } catch {
        // Question might have already been removed
      }
    }

    // Add new questions
    for (const question of questions) {
      form.addQuestion(question);
    }
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

