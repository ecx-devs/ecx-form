import { Question } from '../../domain/entities/Question';
import { FormSettingsProps } from '../../domain/value-objects/FormSettings';
import { FormStatus } from '../../domain/entities/Form';

// Request DTOs
export interface CreateFormDTO {
  title: string;
  description?: string;
}

export interface UpdateFormDTO {
  title?: string;
  description?: string;
  questions?: Question[];
  settings?: Partial<FormSettingsProps>;
}

export interface PublishFormDTO {
  formId: string;
}

// Response DTOs
export interface FormResponseDTO {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  settings: FormSettingsProps;
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
  publicUrl?: string;
}

export interface FormListItemDTO {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicFormDTO {
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
    headerImagePosition: string;
  };
}

