import { IFormRepository } from "../../../domain/repositories/IFormRepository";
import { ISubmissionRepository } from "../../../domain/repositories/ISubmissionRepository";
import { FormId } from "../../../domain/value-objects/FormId";
import { NotFoundError } from "../form/GetFormUseCase";
import * as XLSX from "xlsx";

export type ExportFormat = "xlsx" | "json";

export interface ExportResult {
  data: string | Buffer;
  filename: string;
  contentType: string;
}

type ExportQuestion = typeof Form.prototype.questions[number] & {
  sectionTitle?: string;
};

export class ExportSubmissionsUseCase {
  constructor(
    private readonly formRepository: IFormRepository,
    private readonly submissionRepository: ISubmissionRepository,
  ) {}

  async execute(
    formId: string,
    format: ExportFormat = "xlsx",
  ): Promise<ExportResult> {
    const id = FormId.fromString(formId);
    const form = await this.formRepository.findById(id);

    if (!form) {
      throw new NotFoundError(`Form with ID ${formId} not found`);
    }

    const submissions = await this.submissionRepository.findByFormId(formId);
    const questions = this.getExportQuestions(form.questions);

    if (format === "json") {
      return this.exportAsJson(formId, form.title, questions, submissions);
    }

    return this.exportAsXlsx(formId, form.title, questions, submissions);
  }

  private exportAsXlsx(
    formId: string,
    formTitle: string,
    questions: ExportQuestion[],
    submissions: Awaited<
      ReturnType<typeof this.submissionRepository.findByFormId>
    >,
  ): ExportResult {
    const exportedAt = new Date();
    const metadataRows = [
      [`${formTitle} responses`],
      ["Form ID", formId],
      ["Exported at", exportedAt],
      ["Total responses", submissions.length],
      [],
    ];
    const sectionHeaders = [
      "",
      "",
      ...questions.map((q) => q.sectionTitle || "Form questions"),
    ];
    const headers = [
      "Submission ID",
      "Submitted at",
      ...questions.map((q) => this.buildQuestionHeader(q)),
    ];

    const dataRows = submissions.map((sub) => {
      const json = sub.toJSON();
      return [
        json.id,
        new Date(json.submittedAt),
        ...questions.map((q) => {
          const answer = json.answers.find((a) => a.questionId === q.id);
          return answer ? this.formatAnswerForExport(answer.value) : "";
        }),
      ];
    });

    const worksheetData = [
      ...metadataRows,
      sectionHeaders,
      headers,
      ...dataRows,
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const lastColumn = Math.max(headers.length - 1, 0);
    const headerRowNumber = metadataRows.length + 2;
    const dataStartRowNumber = headerRowNumber + 1;

    worksheet["!cols"] = headers.map((header, i) => {
      const values = [
        header,
        sectionHeaders[i],
        ...dataRows.map((row) => String(row[i] || "")),
      ];
      const maxLength = Math.max(...values.map((value) => value.length));
      const width = i === 0 ? 20 : i === 1 ? 22 : Math.min(maxLength + 4, 42);
      return { wch: Math.max(width, 14) };
    });
    worksheet["!autofilter"] = {
      ref: XLSX.utils.encode_range({
        s: { r: headerRowNumber - 1, c: 0 },
        e: {
          r: Math.max(headerRowNumber - 1, dataStartRowNumber + dataRows.length - 2),
          c: lastColumn,
        },
      }),
    };
    worksheet["!freeze"] = {
      xSplit: 0,
      ySplit: headerRowNumber,
      topLeftCell: `A${dataStartRowNumber}`,
      activePane: "bottomLeft",
      state: "frozen",
    };
    worksheet["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: lastColumn },
      },
      ...this.buildSectionMerges(sectionHeaders, metadataRows.length),
    ];

    this.applyCellFormats(worksheet, headerRowNumber, dataRows.length);

    const questionsSheet = this.buildQuestionsSheet(questions);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");
    XLSX.utils.book_append_sheet(workbook, questionsSheet, "Questions");
    workbook.Props = {
      Title: `${formTitle} responses`,
      Subject: "ECX Forms response export",
      Author: "ECX Forms",
      CreatedDate: exportedAt,
    };

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
      cellDates: true,
    });
    const safeTitle = this.toSafeFilename(formTitle);

    return {
      data: buffer,
      filename: `${formId}_${safeTitle}_responses.xlsx`,
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  private exportAsJson(
    formId: string,
    formTitle: string,
    questions: ExportQuestion[],
    submissions: Awaited<
      ReturnType<typeof this.submissionRepository.findByFormId>
    >,
  ): ExportResult {
    const data = {
      formId,
      formTitle,
      exportedAt: new Date().toISOString(),
      totalResponses: submissions.length,
      questions: questions.map((q) => ({
        id: q.id,
        title: q.title,
        type: q.type,
        sectionTitle: q.sectionTitle,
      })),
      responses: submissions.map((sub) => {
        const json = sub.toJSON();
        return {
          submissionId: json.id,
          submittedAt: json.submittedAt,
          answers: json.answers.reduce(
            (acc, answer) => {
              const question = questions.find(
                (q) => q.id === answer.questionId,
              );
              if (question) {
                acc[question.title] = answer.value;
              }
              return acc;
            },
            {} as Record<string, unknown>,
          ),
        };
      }),
    };

    const safeTitle = this.toSafeFilename(formTitle);

    return {
      data: JSON.stringify(data, null, 2),
      filename: `${formId}_${safeTitle}_responses.json`,
      contentType: "application/json",
    };
  }

  private getExportQuestions(
    questions: typeof Form.prototype.questions,
  ): ExportQuestion[] {
    let sectionTitle: string | undefined;

    return questions.reduce<ExportQuestion[]>((acc, question) => {
      if (question.type === "section") {
        sectionTitle = question.title;
        return acc;
      }

      acc.push({ ...question, sectionTitle });
      return acc;
    }, []);
  }

  private buildQuestionHeader(question: ExportQuestion): string {
    const requiredMark = question.required ? " *" : "";
    return `${question.title}${requiredMark}`;
  }

  private formatAnswerForExport(value: string | string[] | null): string {
    if (value === null) return "";

    if (Array.isArray(value)) {
      return value.join("; ");
    }

    if (typeof value !== "string") {
      return String(value);
    }

    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && "fileName" in parsed) {
        return parsed.filePath
          ? `${parsed.fileName} (${parsed.filePath})`
          : String(parsed.fileName);
      }
    } catch {
      // Plain text answer, not JSON metadata.
    }

    return value;
  }

  private buildSectionMerges(
    sectionHeaders: string[],
    sectionRowIndex: number,
  ): XLSX.Range[] {
    const merges: XLSX.Range[] = [];
    let startColumn = 2;

    while (startColumn < sectionHeaders.length) {
      const sectionTitle = sectionHeaders[startColumn];
      let endColumn = startColumn;

      while (
        endColumn + 1 < sectionHeaders.length &&
        sectionHeaders[endColumn + 1] === sectionTitle
      ) {
        endColumn += 1;
      }

      if (endColumn > startColumn) {
        merges.push({
          s: { r: sectionRowIndex, c: startColumn },
          e: { r: sectionRowIndex, c: endColumn },
        });
      }

      startColumn = endColumn + 1;
    }

    return merges;
  }

  private applyCellFormats(
    worksheet: XLSX.WorkSheet,
    headerRowNumber: number,
    dataRowCount: number,
  ): void {
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");

    for (let row = range.s.r; row <= range.e.r; row += 1) {
      for (let col = range.s.c; col <= range.e.c; col += 1) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        if (!cell) continue;

        cell.s = {
          alignment: {
            vertical: "top",
            wrapText: row >= headerRowNumber - 2,
          },
          font: row === 0 || row === headerRowNumber - 1 ? { bold: true } : {},
        };
      }
    }

    worksheet["B3"] = {
      ...worksheet["B3"],
      t: "d",
      z: "yyyy-mm-dd hh:mm",
    };

    for (let row = headerRowNumber; row < headerRowNumber + dataRowCount; row += 1) {
      const submittedAtCell = worksheet[`B${row + 1}`];
      if (submittedAtCell) {
        submittedAtCell.t = "d";
        submittedAtCell.z = "yyyy-mm-dd hh:mm";
      }
    }
  }

  private buildQuestionsSheet(questions: ExportQuestion[]): XLSX.WorkSheet {
    const worksheet = XLSX.utils.json_to_sheet(
      questions.map((question, index) => ({
        Order: index + 1,
        Section: question.sectionTitle || "Form questions",
        Question: question.title,
        Type: question.type,
        Required: question.required ? "Yes" : "No",
      })),
    );

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 28 },
      { wch: 42 },
      { wch: 18 },
      { wch: 12 },
    ];
    worksheet["!autofilter"] = {
      ref: worksheet["!ref"] || "A1:E1",
    };

    return worksheet;
  }

  private toSafeFilename(value: string): string {
    const safeValue = value
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    return safeValue || "form";
  }
}

// Type helper for Form
import { Form } from "../../../domain/entities/Form";
