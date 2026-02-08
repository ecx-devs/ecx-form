import { Submission } from "../../../domain/entities/Submission";
import { Question } from "../../../domain/entities/Question";
import { IFormRepository } from "../../../domain/repositories/IFormRepository";
import { ISubmissionRepository } from "../../../domain/repositories/ISubmissionRepository";
import { FormId } from "../../../domain/value-objects/FormId";
import { CreateSubmissionDTO, SubmitSuccessDTO } from "../../dto/SubmissionDTO";
import { NotFoundError } from "../form/GetFormUseCase";
import { FormNotPublishedError } from "../form/GetPublicFormUseCase";

export class SubmitFormUseCase {
  constructor(
    private readonly formRepository: IFormRepository,
    private readonly submissionRepository: ISubmissionRepository,
  ) {}

  async execute(dto: CreateSubmissionDTO): Promise<SubmitSuccessDTO> {
    const formId = FormId.fromString(dto.formId);
    const form = await this.formRepository.findById(formId);

    if (!form) {
      throw new NotFoundError("Form not found");
    }

    if (!form.isPublished) {
      throw new FormNotPublishedError("This form is not accepting responses");
    }

    // Check if form is accepting responses
    if (!form.settings.acceptingResponses) {
      throw new FormNotPublishedError(
        "This form is no longer accepting responses",
      );
    }

    // Check for "Fill Once" restriction
    if (form.settings.limitToOneResponse && dto.metadata.localStorageKey) {
      const alreadySubmitted =
        await this.submissionRepository.existsByLocalStorageKey(
          dto.formId,
          dto.metadata.localStorageKey,
        );

      if (alreadySubmitted) {
        throw new AlreadySubmittedError(
          "You have already submitted a response to this form",
        );
      }
    }

    // Validate required fields
    this.validateRequiredFields(form.questions, dto.answers);

    // Get submission count for ID generation
    const submissionCount = await this.submissionRepository.countByFormId(
      dto.formId,
    );

    // Create submission
    const submission = Submission.create(
      dto.formId,
      dto.answers,
      dto.metadata,
      submissionCount,
    );

    await this.submissionRepository.create(submission);

    return {
      submissionId: submission.id.value,
      confirmationMessage: form.settings.confirmationMessage,
      allowEditing: form.settings.allowResponseEditing,
      editUrl: form.settings.allowResponseEditing
        ? `/forms/${dto.formId}/edit/${submission.id.value}`
        : undefined,
    };
  }

  private validateRequiredFields(
    questions: Question[],
    answers: CreateSubmissionDTO["answers"],
  ): void {
    const requiredQuestions = questions.filter((q: Question) => q.required);

    for (const question of requiredQuestions) {
      const answer = answers.find((a) => a.questionId === question.id);

      if (!answer || this.isEmptyAnswer(answer.value)) {
        throw new ValidationError(`Question "${question.title}" is required`);
      }
    }
  }

  private isEmptyAnswer(value: string | string[] | null): boolean {
    if (value === null) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    return true;
  }
}

export class AlreadySubmittedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlreadySubmittedError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
