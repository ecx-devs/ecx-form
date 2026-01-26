import { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { ISubmissionRepository } from '../../../domain/repositories/ISubmissionRepository';
import { FormId } from '../../../domain/value-objects/FormId';
import { NotFoundError } from '../form/GetFormUseCase';

export type ExportFormat = 'csv' | 'json';

export interface ExportResult {
  data: string;
  filename: string;
  contentType: string;
}

export class ExportSubmissionsUseCase {
  constructor(
    private readonly formRepository: IFormRepository,
    private readonly submissionRepository: ISubmissionRepository
  ) {}

  async execute(formId: string, format: ExportFormat = 'csv'): Promise<ExportResult> {
    const id = FormId.fromString(formId);
    const form = await this.formRepository.findById(id);

    if (!form) {
      throw new NotFoundError(`Form with ID ${formId} not found`);
    }

    const submissions = await this.submissionRepository.findByFormId(formId);
    const questions = form.questions;

    if (format === 'json') {
      return this.exportAsJson(formId, form.title, questions, submissions);
    }

    return this.exportAsCsv(formId, form.title, questions, submissions);
  }

  private exportAsCsv(
    formId: string,
    formTitle: string,
    questions: typeof Form.prototype.questions,
    submissions: Awaited<ReturnType<typeof this.submissionRepository.findByFormId>>
  ): ExportResult {
    // Create header row
    const headers = ['Submission ID', 'Submitted At', ...questions.map(q => q.title)];
    const headerRow = this.escapeCSVRow(headers);

    // Create data rows
    const dataRows = submissions.map(sub => {
      const json = sub.toJSON();
      const row = [
        json.id,
        new Date(json.submittedAt).toISOString(),
        ...questions.map(q => {
          const answer = json.answers.find(a => a.questionId === q.id);
          if (!answer) return '';
          if (Array.isArray(answer.value)) {
            return answer.value.join('; ');
          }
          return answer.value || '';
        }),
      ];
      return this.escapeCSVRow(row);
    });

    const csv = [headerRow, ...dataRows].join('\n');
    const safeTitle = formTitle.replace(/[^a-zA-Z0-9]/g, '_');

    return {
      data: csv,
      filename: `${formId}_${safeTitle}_responses.csv`,
      contentType: 'text/csv',
    };
  }

  private exportAsJson(
    formId: string,
    formTitle: string,
    questions: typeof Form.prototype.questions,
    submissions: Awaited<ReturnType<typeof this.submissionRepository.findByFormId>>
  ): ExportResult {
    const data = {
      formId,
      formTitle,
      exportedAt: new Date().toISOString(),
      totalResponses: submissions.length,
      questions: questions.map(q => ({
        id: q.id,
        title: q.title,
        type: q.type,
      })),
      responses: submissions.map(sub => {
        const json = sub.toJSON();
        return {
          submissionId: json.id,
          submittedAt: json.submittedAt,
          answers: json.answers.reduce((acc, answer) => {
            const question = questions.find(q => q.id === answer.questionId);
            if (question) {
              acc[question.title] = answer.value;
            }
            return acc;
          }, {} as Record<string, unknown>),
        };
      }),
    };

    const safeTitle = formTitle.replace(/[^a-zA-Z0-9]/g, '_');

    return {
      data: JSON.stringify(data, null, 2),
      filename: `${formId}_${safeTitle}_responses.json`,
      contentType: 'application/json',
    };
  }

  private escapeCSVRow(row: string[]): string {
    return row
      .map(cell => {
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(',');
  }
}

// Type helper for Form
import { Form } from '../../../domain/entities/Form';

