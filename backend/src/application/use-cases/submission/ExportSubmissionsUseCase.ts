import { IFormRepository } from "../../../domain/repositories/IFormRepository";
import { ISubmissionRepository } from "../../../domain/repositories/ISubmissionRepository";
import { Form } from "../../../domain/entities/Form";
import { FormId } from "../../../domain/value-objects/FormId";
import { NotFoundError } from "../form/GetFormUseCase";
import ExcelJS from "exceljs";
import { google } from "googleapis";

export type ExportFormat = "xlsx" | "json";

export interface ExportResult {
  data: string | Buffer;
  filename: string;
  contentType: string;
}

export interface GoogleSheetsExportResult {
  spreadsheetId: string;
  url: string;
  title: string;
  syncedAt: string;
}

interface GoogleSheetTabs {
  responsesSheetId: number;
  questionsSheetId: number;
}

type ExportQuestion = typeof Form.prototype.questions[number] & {
  sectionTitle?: string;
};

interface ResponseExportData {
  exportedAt: Date;
  metadataRows: unknown[][];
  sectionHeaders: string[];
  headers: string[];
  dataRows: unknown[][];
}

interface SheetRange {
  s: { r: number; c: number };
  e: { r: number; c: number };
}

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

  async exportToGoogleSheets(formId: string): Promise<GoogleSheetsExportResult> {
    const id = FormId.fromString(formId);
    const form = await this.formRepository.findById(id);

    if (!form) {
      throw new NotFoundError(`Form with ID ${formId} not found`);
    }

    const submissions = await this.submissionRepository.findByFormId(formId);
    const questions = this.getExportQuestions(form.questions);
    const exportData = this.buildResponseExportData(
      formId,
      form.title,
      questions,
      submissions,
    );

    const syncedAt = new Date().toISOString();
    const existingSpreadsheetId = form.settings.googleSheetsSpreadsheetId;

    if (existingSpreadsheetId && form.settings.googleSheetsUrl) {
      await this.syncGoogleSheetData(
        existingSpreadsheetId,
        questions,
        exportData,
      );
      form.updateSettings({ googleSheetsLastSyncedAt: syncedAt });
      await this.formRepository.update(form);

      return {
        spreadsheetId: existingSpreadsheetId,
        title: form.settings.googleSheetsTitle || `${form.title} responses`,
        url: form.settings.googleSheetsUrl,
        syncedAt,
      };
    }

    const result = await this.createGoogleSheet(form.title, questions, exportData);
    form.updateSettings({
      googleSheetsSpreadsheetId: result.spreadsheetId,
      googleSheetsUrl: result.url,
      googleSheetsTitle: result.title,
      googleSheetsLinkedAt: syncedAt,
      googleSheetsLastSyncedAt: syncedAt,
    });
    await this.formRepository.update(form);

    return { ...result, syncedAt };
  }

  async syncLinkedGoogleSheet(formId: string): Promise<void> {
    const id = FormId.fromString(formId);
    const form = await this.formRepository.findById(id);

    if (!form?.settings.googleSheetsSpreadsheetId) return;

    const submissions = await this.submissionRepository.findByFormId(formId);
    const questions = this.getExportQuestions(form.questions);
    const exportData = this.buildResponseExportData(
      formId,
      form.title,
      questions,
      submissions,
    );
    const syncedAt = new Date().toISOString();

    await this.syncGoogleSheetData(
      form.settings.googleSheetsSpreadsheetId,
      questions,
      exportData,
    );
    form.updateSettings({ googleSheetsLastSyncedAt: syncedAt });
    await this.formRepository.update(form);
  }

  private async exportAsXlsx(
    formId: string,
    formTitle: string,
    questions: ExportQuestion[],
    submissions: Awaited<
      ReturnType<typeof this.submissionRepository.findByFormId>
    >,
  ): Promise<ExportResult> {
    const exportData = this.buildResponseExportData(
      formId,
      formTitle,
      questions,
      submissions,
    );
    const { exportedAt, metadataRows, sectionHeaders, headers, dataRows } =
      exportData;
    const totalColumns = headers.length;
    const headerRowNumber = metadataRows.length + 2;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ECX Forms";
    workbook.created = exportedAt;
    workbook.modified = exportedAt;
    workbook.subject = "ECX Forms response export";
    workbook.title = `${formTitle} responses`;

    const worksheet = workbook.addWorksheet("Responses", {
      views: [{ state: "frozen", ySplit: headerRowNumber }],
    });

    metadataRows.forEach((row) => worksheet.addRow(row));
    worksheet.addRow(sectionHeaders);

    worksheet.mergeCells(1, 1, 1, totalColumns);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2699E3" },
    };
    titleCell.alignment = { vertical: "middle" };
    worksheet.getRow(1).height = 28;

    const labelFill = {
      type: "pattern" as const,
      pattern: "solid" as const,
      fgColor: { argb: "FFEAF6FD" },
    };
    for (let rowNumber = 2; rowNumber <= 4; rowNumber += 1) {
      const labelCell = worksheet.getCell(rowNumber, 1);
      labelCell.font = { bold: true, color: { argb: "FF1F2937" } };
      labelCell.fill = labelFill;
      worksheet.getCell(rowNumber, 2).alignment = { wrapText: true };
    }
    worksheet.getCell(3, 2).numFmt = "yyyy-mm-dd hh:mm";

    const sectionRow = worksheet.getRow(metadataRows.length + 1);
    sectionRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FF1F2937" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFDFF2FD" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = this.getTableCellBorder();
    });
    this.buildSectionMerges(sectionHeaders, metadataRows.length).forEach(
      (range) => {
        worksheet.mergeCells(
          range.s.r + 1,
          range.s.c + 1,
          range.e.r + 1,
          range.e.c + 1,
        );
      },
    );

    worksheet.addTable({
      name: "ResponsesTable",
      ref: `A${headerRowNumber}`,
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium2",
        showRowStripes: true,
      },
      columns: headers.map((header) => ({
        name: header,
        filterButton: true,
      })),
      rows: dataRows,
    });

    this.applyExcelWorksheetFormatting(
      worksheet,
      headers,
      sectionHeaders,
      dataRows,
      headerRowNumber,
    );
    this.addQuestionsWorksheet(workbook, questions);

    const excelBuffer = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.isBuffer(excelBuffer)
      ? excelBuffer
      : Buffer.from(excelBuffer);
    const safeTitle = this.toSafeFilename(formTitle);

    return {
      data: buffer,
      filename: `${safeTitle}.xlsx`,
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

  private buildResponseExportData(
    formId: string,
    formTitle: string,
    questions: ExportQuestion[],
    submissions: Awaited<
      ReturnType<typeof this.submissionRepository.findByFormId>
    >,
  ): ResponseExportData {
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

    return {
      exportedAt,
      metadataRows,
      sectionHeaders,
      headers,
      dataRows,
    };
  }

  private async createGoogleSheet(
    formTitle: string,
    questions: ExportQuestion[],
    exportData: ResponseExportData,
  ): Promise<GoogleSheetsExportResult> {
    const auth = this.createGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const drive = google.drive({ version: "v3", auth });
    const title = `${formTitle} responses`;
    const spreadsheetId = await this.createGoogleSpreadsheetFile(
      sheets,
      drive,
      title,
    );
    await this.syncGoogleSheetData(spreadsheetId, questions, exportData);

    const shareEmail = process.env.GOOGLE_SHEETS_SHARE_EMAIL;
    if (shareEmail) {
      try {
        await drive.permissions.create({
          fileId: spreadsheetId,
          supportsAllDrives: true,
          sendNotificationEmail: false,
          requestBody: {
            type: "user",
            role: process.env.GOOGLE_SHEETS_SHARE_ROLE || "writer",
            emailAddress: shareEmail,
          },
        });
      } catch (error) {
        console.warn("[Google Sheets] Failed to share exported sheet", error);
      }
    }

    return {
      spreadsheetId,
      title,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      syncedAt: new Date().toISOString(),
    };
  }

  private async syncGoogleSheetData(
    spreadsheetId: string,
    questions: ExportQuestion[],
    exportData: ResponseExportData,
  ): Promise<void> {
    const auth = this.createGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const tabs = await this.setupGoogleSheetTabs(sheets, spreadsheetId);

    await Promise.all([
      sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: "Responses!A:ZZ",
      }),
      sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: "Questions!A:ZZ",
      }),
    ]);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Responses!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: this.toGoogleSheetValues([
          ...exportData.metadataRows,
          exportData.sectionHeaders,
          exportData.headers,
          ...exportData.dataRows,
        ]),
      },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Questions!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          ["Order", "Section", "Question", "Type", "Required"],
          ...questions.map((question, index) => [
            index + 1,
            question.sectionTitle || "Form questions",
            question.title,
            question.type,
            question.required ? "Yes" : "No",
          ]),
        ],
      },
    });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: this.buildGoogleSheetsFormattingRequests(
          exportData,
          questions.length,
          tabs.responsesSheetId,
          tabs.questionsSheetId,
        ),
      },
    });
  }

  private createGoogleAuth() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (clientId && clientSecret && refreshToken) {
      const auth = new google.auth.OAuth2(clientId, clientSecret);
      auth.setCredentials({ refresh_token: refreshToken });
      return auth;
    }

    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!clientEmail || !privateKey) {
      throw new GoogleSheetsNotConfiguredError(
        "Google Sheets export is not configured",
      );
    }

    return new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ],
    });
  }

  private async createGoogleSpreadsheetFile(
    sheets: ReturnType<typeof google.sheets>,
    drive: ReturnType<typeof google.drive>,
    title: string,
  ): Promise<string> {
    const parentId =
      process.env.GOOGLE_DRIVE_PARENT_ID || process.env.GOOGLE_SHARED_DRIVE_ID;

    if (parentId) {
      const created = await drive.files.create({
        supportsAllDrives: true,
        fields: "id",
        requestBody: {
          name: title,
          mimeType: "application/vnd.google-apps.spreadsheet",
          parents: [parentId],
        },
      });

      if (!created.data.id) {
        throw new Error("Google Drive did not return a spreadsheet ID");
      }

      return created.data.id;
    }

    const created = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
      },
    });

    if (!created.data.spreadsheetId) {
      throw new Error("Google Sheets did not return a spreadsheet ID");
    }

    return created.data.spreadsheetId;
  }

  private async setupGoogleSheetTabs(
    sheets: ReturnType<typeof google.sheets>,
    spreadsheetId: string,
  ): Promise<GoogleSheetTabs> {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets(properties(sheetId,title))",
    });

    const sheetProperties =
      spreadsheet.data.sheets
        ?.map((sheet) => sheet.properties)
        .filter((properties) => properties?.sheetId !== undefined) ?? [];
    const responsesSheet = sheetProperties.find(
      (properties) => properties?.title === "Responses",
    );
    const questionsSheet = sheetProperties.find(
      (properties) => properties?.title === "Questions",
    );
    const defaultSheetId = sheetProperties[0]?.sheetId;

    if (defaultSheetId === undefined || defaultSheetId === null) {
      throw new Error("Google Sheets did not return a default sheet ID");
    }

    const requests = [];
    const responsesSheetId = responsesSheet?.sheetId ?? defaultSheetId;
    let questionsSheetId = questionsSheet?.sheetId;

    if (!responsesSheet) {
      requests.push({
        updateSheetProperties: {
          properties: {
            sheetId: responsesSheetId,
            title: "Responses",
          },
          fields: "title",
        },
      });
    }

    if (questionsSheetId === undefined || questionsSheetId === null) {
      const existingSheetIds = sheetProperties
        .map((properties) => properties?.sheetId)
        .filter((sheetId): sheetId is number => sheetId !== undefined);
      questionsSheetId = Math.max(...existingSheetIds, 0) + 1;
      requests.push({
        addSheet: {
          properties: {
            sheetId: questionsSheetId,
            title: "Questions",
          },
        },
      });
    }

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests,
        },
      });
    }

    return {
      responsesSheetId,
      questionsSheetId,
    };
  }

  private toGoogleSheetValues(rows: unknown[][]): unknown[][] {
    return rows.map((row) =>
      row.map((value) => {
        if (value instanceof Date) return value.toISOString();
        return value;
      }),
    );
  }

  private buildGoogleSheetsFormattingRequests(
    exportData: ResponseExportData,
    questionCount: number,
    responsesSheetId: number,
    questionsSheetId: number,
  ) {
    const headerRowIndex = exportData.metadataRows.length + 1;
    const sectionRowIndex = exportData.metadataRows.length;
    const totalColumns = exportData.headers.length;
    const totalRows =
      exportData.metadataRows.length + 2 + exportData.dataRows.length;

    return [
      {
        clearBasicFilter: {
          sheetId: responsesSheetId,
        },
      },
      {
        unmergeCells: {
          range: {
            sheetId: responsesSheetId,
            startRowIndex: 0,
            endRowIndex: Math.max(totalRows, 1),
            startColumnIndex: 0,
            endColumnIndex: totalColumns,
          },
        },
      },
      {
        mergeCells: {
          range: {
            sheetId: responsesSheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: totalColumns,
          },
          mergeType: "MERGE_ALL",
        },
      },
      ...this.buildGoogleSheetSectionMerges(
        exportData.sectionHeaders,
        sectionRowIndex,
        responsesSheetId,
      ),
      {
        repeatCell: {
          range: {
            sheetId: responsesSheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: totalColumns,
          },
          cell: {
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 14 },
            },
          },
          fields: "userEnteredFormat.textFormat",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: responsesSheetId,
            startRowIndex: sectionRowIndex,
            endRowIndex: headerRowIndex + 1,
            startColumnIndex: 0,
            endColumnIndex: totalColumns,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.91, green: 0.96, blue: 0.99 },
              horizontalAlignment: "CENTER",
              verticalAlignment: "MIDDLE",
              wrapStrategy: "WRAP",
              textFormat: { bold: true },
            },
          },
          fields:
            "userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment,wrapStrategy,textFormat)",
        },
      },
      {
        setBasicFilter: {
          filter: {
            range: {
              sheetId: responsesSheetId,
              startRowIndex: headerRowIndex,
              endRowIndex: Math.max(headerRowIndex + 1, totalRows),
              startColumnIndex: 0,
              endColumnIndex: totalColumns,
            },
          },
        },
      },
      {
        updateSheetProperties: {
          properties: {
            sheetId: responsesSheetId,
            gridProperties: {
              frozenRowCount: headerRowIndex + 1,
            },
          },
          fields: "gridProperties.frozenRowCount",
        },
      },
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: responsesSheetId,
            dimension: "COLUMNS",
            startIndex: 0,
            endIndex: totalColumns,
          },
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: questionsSheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 5,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.91, green: 0.96, blue: 0.99 },
              textFormat: { bold: true },
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat)",
        },
      },
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: questionsSheetId,
            dimension: "COLUMNS",
            startIndex: 0,
            endIndex: Math.max(questionCount, 5),
          },
        },
      },
      {
        updateSheetProperties: {
          properties: {
            sheetId: questionsSheetId,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
          fields: "gridProperties.frozenRowCount",
        },
      },
    ];
  }

  private buildGoogleSheetSectionMerges(
    sectionHeaders: string[],
    sectionRowIndex: number,
    responsesSheetId: number,
  ) {
    return this.buildSectionMerges(sectionHeaders, sectionRowIndex).map(
      (range) => ({
        mergeCells: {
          range: {
            sheetId: responsesSheetId,
            startRowIndex: range.s.r,
            endRowIndex: range.e.r + 1,
            startColumnIndex: range.s.c,
            endColumnIndex: range.e.c + 1,
          },
          mergeType: "MERGE_ALL",
        },
      }),
    );
  }

  private buildSectionMerges(
    sectionHeaders: string[],
    sectionRowIndex: number,
  ): SheetRange[] {
    const merges: SheetRange[] = [];
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

  private applyExcelWorksheetFormatting(
    worksheet: ExcelJS.Worksheet,
    headers: string[],
    sectionHeaders: string[],
    dataRows: unknown[][],
    headerRowNumber: number,
  ): void {
    const border = this.getTableCellBorder();

    worksheet.columns = headers.map((header, index) => {
      const values = [
        header,
        sectionHeaders[index],
        ...dataRows.map((row) => String(row[index] || "")),
      ];
      const maxLength = Math.max(...values.map((value) => value.length));
      const width =
        index === 0 ? 22 : index === 1 ? 24 : Math.min(maxLength + 4, 46);
      return { width: Math.max(width, 14) };
    });

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "top",
          wrapText: rowNumber >= headerRowNumber,
        };
        cell.border = border;
      });
    });

    const headerRow = worksheet.getRow(headerRowNumber);
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2699E3" },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
    });

    for (
      let rowNumber = headerRowNumber + 1;
      rowNumber <= headerRowNumber + dataRows.length;
      rowNumber += 1
    ) {
      const row = worksheet.getRow(rowNumber);
      row.getCell(2).numFmt = "yyyy-mm-dd hh:mm";
      row.eachCell((cell) => {
        cell.alignment = { vertical: "top", wrapText: true };
        cell.border = border;
      });
    }
  }

  private addQuestionsWorksheet(
    workbook: ExcelJS.Workbook,
    questions: ExportQuestion[],
  ): void {
    const worksheet = workbook.addWorksheet("Questions", {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    const rows = questions.map((question, index) => [
      index + 1,
      question.sectionTitle || "Form questions",
      question.title,
      question.type,
      question.required ? "Yes" : "No",
    ]);

    worksheet.addTable({
      name: "QuestionsTable",
      ref: "A1",
      headerRow: true,
      totalsRow: false,
      style: {
        theme: "TableStyleMedium2",
        showRowStripes: true,
      },
      columns: ["Order", "Section", "Question", "Type", "Required"].map(
        (name) => ({
          name,
          filterButton: true,
        }),
      ),
      rows,
    });

    worksheet.columns = [
      { width: 10 },
      { width: 30 },
      { width: 48 },
      { width: 20 },
      { width: 14 },
    ];
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: "top", wrapText: true };
        cell.border = this.getTableCellBorder();
      });
    });
  }

  private getTableCellBorder(): Partial<ExcelJS.Borders> {
    return {
      top: { style: "thin", color: { argb: "FFD8E4EA" } },
      left: { style: "thin", color: { argb: "FFD8E4EA" } },
      bottom: { style: "thin", color: { argb: "FFD8E4EA" } },
      right: { style: "thin", color: { argb: "FFD8E4EA" } },
    };
  }

  private toSafeFilename(value: string): string {
    const safeValue = value
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    return safeValue || "form";
  }
}

export class GoogleSheetsNotConfiguredError extends Error {
  statusCode = 503;
  code = "GOOGLE_SHEETS_NOT_CONFIGURED";

  constructor(message: string) {
    super(message);
    this.name = "GoogleSheetsNotConfiguredError";
  }
}
