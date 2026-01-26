import { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { ISubmissionRepository } from '../../../domain/repositories/ISubmissionRepository';
import { FormId } from '../../../domain/value-objects/FormId';
import { SubmissionListResponseDTO, SubmissionResponseDTO } from '../../dto/SubmissionDTO';
import { NotFoundError } from '../form/GetFormUseCase';

export class GetSubmissionsUseCase {
  constructor(
    private readonly formRepository: IFormRepository,
    private readonly submissionRepository: ISubmissionRepository
  ) {}

  async execute(formId: string): Promise<SubmissionListResponseDTO> {
    const id = FormId.fromString(formId);
    const form = await this.formRepository.findById(id);

    if (!form) {
      throw new NotFoundError(`Form with ID ${formId} not found`);
    }

    const submissions = await this.submissionRepository.findByFormId(formId);

    return {
      submissions: submissions.map(sub => this.toResponse(sub)),
      total: submissions.length,
      formTitle: form.title,
    };
  }

  private toResponse(submission: ReturnType<typeof this.submissionRepository.findByFormId> extends Promise<infer T> ? T extends Array<infer U> ? U : never : never): SubmissionResponseDTO {
    const json = submission.toJSON();
    return {
      id: json.id,
      formId: json.formId,
      answers: json.answers,
      submittedAt: json.submittedAt.toISOString(),
    };
  }
}

