import { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { FormId } from '../../../domain/value-objects/FormId';
import { NotFoundError } from './GetFormUseCase';

export class DeleteFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute(formId: string): Promise<void> {
    const id = FormId.fromString(formId);
    const exists = await this.formRepository.exists(id);
    
    if (!exists) {
      throw new NotFoundError(`Form with ID ${formId} not found`);
    }

    await this.formRepository.delete(id);
  }
}

