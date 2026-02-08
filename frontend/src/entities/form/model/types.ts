import { Question } from "../../question";

export type FormStatus = "draft" | "published";

export interface FormSettings {
  limitToOneResponse: boolean;
  allowResponseEditing: boolean;
  confirmationMessage: string;
  showProgressBar: boolean;
  shuffleQuestions: boolean;
  acceptingResponses: boolean;
}

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
};
