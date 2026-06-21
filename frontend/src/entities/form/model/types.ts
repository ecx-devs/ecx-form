import { Question } from "../../question";

export type FormStatus = "draft" | "published";

export interface FormSettings {
  limitToOneResponse: boolean;
  allowResponseEditing: boolean;
  confirmationMessage: string;
  showProgressBar: boolean;
  shuffleQuestions: boolean;
  acceptingResponses: boolean;
  themeColor: string;
  headerImageUrl?: string | null;
  headerImagePosition: HeaderImagePosition;
  googleSheetsSpreadsheetId?: string;
  googleSheetsUrl?: string;
  googleSheetsTitle?: string;
  googleSheetsLinkedAt?: string;
  googleSheetsLastSyncedAt?: string;
}

export type HeaderImagePosition =
  | "left top"
  | "left center"
  | "left bottom"
  | "center top"
  | "center center"
  | "center bottom"
  | "right top"
  | "right center"
  | "right bottom";

export interface Form {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  settings: FormSettings;
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
  publicUrl?: string;
}

export interface FormListItem {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicForm {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  settings: {
    limitToOneResponse: boolean;
    allowResponseEditing: boolean;
    showProgressBar: boolean;
    themeColor: string;
    headerImageUrl?: string | null;
    headerImagePosition: HeaderImagePosition;
  };
}

export interface CreateFormInput {
  title: string;
  description?: string;
}

export interface UpdateFormInput {
  title?: string;
  description?: string;
  questions?: Question[];
  settings?: Partial<FormSettings>;
}

export const DEFAULT_FORM_SETTINGS: FormSettings = {
  limitToOneResponse: false,
  allowResponseEditing: false,
  confirmationMessage: "Your response has been recorded.",
  showProgressBar: true,
  shuffleQuestions: false,
  acceptingResponses: true,
  themeColor: "#2699e3",
  headerImageUrl: undefined,
  headerImagePosition: "center center",
  googleSheetsSpreadsheetId: undefined,
  googleSheetsUrl: undefined,
  googleSheetsTitle: undefined,
  googleSheetsLinkedAt: undefined,
  googleSheetsLastSyncedAt: undefined,
};
