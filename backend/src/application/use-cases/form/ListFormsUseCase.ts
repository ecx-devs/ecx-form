import { Form } from '../../../domain/entities/Form';
import { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { FormListItemDTO } from '../../dto/FormDTO';

export class ListFormsUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(): Promise<FormListItemDTO[]> {
    const forms = await this.formRepository.findAll();
    
    return forms.map(form => this.toListItem(form));
  }

  private toListItem(form: Form): FormListItemDTO {
    const json = form.toJSON();
    return {
      id: json.id,
      title: json.title,
      description: json.description,
      status: json.status,
      questionCount: json.questions.length,
      createdAt: json.createdAt.toISOString(),
      updatedAt: json.updatedAt.toISOString(),
    };
  }
}

