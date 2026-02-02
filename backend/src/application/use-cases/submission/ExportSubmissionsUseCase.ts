import { IFormRepository } from '../../../domain/repositories/IFormRepository';
import { ISubmissionRepository } from '../../../domain/repositories/ISubmissionRepository';
import { FormId } from '../../../domain/value-objects/FormId';
import { NotFoundError } from '../form/GetFormUseCase';
import * as XLSX from 'xlsx';

export type ExportFormat = 'xlsx' | 'json';

export interface ExportResult {
  data: string | Buffer;
  filename: string;
  contentType: string;
}

export class ExportSubmissionsUseCase {
  constructor(
    private readonly formRepository: IFormRepository,
    private readonly submissionRepository: ISubmissionRepository
  ) {}

  async execute(formId: string, format: ExportFormat = 'xlsx'): Promise<ExportResult> {
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

    return this.exportAsXlsx(formId, form.title, questions, submissions);
  }

  private exportAsXlsx(
    formId: string,
    formTitle: string,
    questions: typeof Form.prototype.questions,
    submissions: Awaited<ReturnType<typeof this.submissionRepository.findByFormId>>
  ): ExportResult {
    // Create header row
    const headers = ['Submission ID', 'Submitted At', ...questions.map(q => q.title)];

    // Create data rows
    const dataRows = submissions.map(sub => {
      const json = sub.toJSON();
      return [
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
    });

    // Create workbook and worksheet
    const worksheetData = [headers, ...dataRows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Auto-size columns
    const colWidths = headers.map((header, i) => {
      const maxLength = Math.max(
        header.length,
        ...dataRows.map(row => String(row[i] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const safeTitle = formTitle.replace(/[^a-zA-Z0-9]/g, '_');

    return {
      data: buffer,
      filename: `${formId}_${safeTitle}_responses.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
}

// Type helper for Form
import { Form } from '../../../domain/entities/Form';

