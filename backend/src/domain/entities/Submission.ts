import { SubmissionId } from '../value-objects/SubmissionId';

export interface SubmissionAnswer {
  questionId: string;
  value: string | string[] | null;
  fileUrl?: string;
}

export interface SubmissionProps {
  id: SubmissionId;
  formId: string;
  answers: SubmissionAnswer[];
  submittedAt: Date;
  metadata: SubmissionMetadata;
}

export interface SubmissionMetadata {
  userAgent?: string;
  ipAddress?: string;
  localStorageKey?: string;
}

export class Submission {
  private readonly _id: SubmissionId;
  private readonly _formId: string;
  private readonly _answers: SubmissionAnswer[];
  private readonly _submittedAt: Date;
  private readonly _metadata: SubmissionMetadata;

  constructor(props: SubmissionProps) {
    this._id = props.id;
    this._formId = props.formId;
    this._answers = props.answers;
    this._submittedAt = props.submittedAt;
    this._metadata = props.metadata;
  }

  static create(
    formId: string,
    answers: SubmissionAnswer[],
    metadata: SubmissionMetadata,
    submissionCount: number
  ): Submission {
    return new Submission({
      id: SubmissionId.generate(formId, submissionCount),
      formId,
      answers,
      submittedAt: new Date(),
      metadata,
    });
  }

  get id(): SubmissionId {
    return this._id;
  }

  get formId(): string {
    return this._formId;
  }

  get answers(): SubmissionAnswer[] {
    return [...this._answers];
  }

  get submittedAt(): Date {
    return this._submittedAt;
  }

  get metadata(): SubmissionMetadata {
    return { ...this._metadata };
  }

  getAnswer(questionId: string): SubmissionAnswer | undefined {
    return this._answers.find(a => a.questionId === questionId);
  }

  toJSON() {
    return {
      id: this._id.value,
      formId: this._formId,
      answers: this._answers,
      submittedAt: this._submittedAt,
      metadata: this._metadata,
    };
  }

  toCSVRow(questionIds: string[]): string[] {
    return questionIds.map(qId => {
      const answer = this.getAnswer(qId);
      if (!answer) return '';
      if (Array.isArray(answer.value)) {
        return answer.value.join('; ');
      }
      return answer.value || '';
    });
  }
}
