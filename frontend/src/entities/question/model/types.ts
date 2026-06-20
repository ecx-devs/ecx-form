export type QuestionType =
  | 'section'
  | 'short_text'
  | 'long_text'
  | 'number'
  | 'multiple_choice'
  | 'checkbox'
  | 'dropdown'
  | 'file_upload';

export type ValidationRule = 'none' | 'email' | 'number' | 'url' | 'phone';

export interface QuestionOption {
  id: string;
  value: string;
  order: number;
}

export interface QuestionValidation {
  rule: ValidationRule;
  customPattern?: string;
  errorMessage?: string;
}

export interface FileConfig {
  maxSizeMB: number;
  allowedTypes?: string[];
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  options?: QuestionOption[];
  validation?: QuestionValidation;
  fileConfig?: FileConfig;
}

export interface CreateQuestionInput {
  type: QuestionType;
  title?: string;
}

// Question type metadata for UI
export const QUESTION_TYPE_CONFIG: Record<
  QuestionType,
  {
    label: string;
    description: string;
    icon: string;
    defaultTitle: string;
    hasOptions: boolean;
    hasFileConfig: boolean;
  }
> = {
  section: {
    label: 'Section',
    description: 'Group questions under a heading',
    icon: 'section',
    defaultTitle: 'Untitled section',
    hasOptions: false,
    hasFileConfig: false,
  },
  short_text: {
    label: 'Short answer',
    description: 'Single line text input',
    icon: 'short-text',
    defaultTitle: 'Question',
    hasOptions: false,
    hasFileConfig: false,
  },
  long_text: {
    label: 'Paragraph',
    description: 'Multi-line text input',
    icon: 'long-text',
    defaultTitle: 'Question',
    hasOptions: false,
    hasFileConfig: false,
  },
  number: {
    label: 'Number',
    description: 'Numeric input with validation',
    icon: 'number',
    defaultTitle: 'Question',
    hasOptions: false,
    hasFileConfig: false,
  },
  multiple_choice: {
    label: 'Multiple choice',
    description: 'Select one option from a list',
    icon: 'radio',
    defaultTitle: 'Question',
    hasOptions: true,
    hasFileConfig: false,
  },
  checkbox: {
    label: 'Checkboxes',
    description: 'Select multiple options',
    icon: 'checkbox',
    defaultTitle: 'Question',
    hasOptions: true,
    hasFileConfig: false,
  },
  dropdown: {
    label: 'Dropdown',
    description: 'Select from a dropdown menu',
    icon: 'dropdown',
    defaultTitle: 'Question',
    hasOptions: true,
    hasFileConfig: false,
  },
  file_upload: {
    label: 'File upload',
    description: 'Upload files (max 2MB)',
    icon: 'file',
    defaultTitle: 'Upload your file',
    hasOptions: false,
    hasFileConfig: true,
  },
};

// Default file config
export const DEFAULT_FILE_CONFIG: FileConfig = {
  maxSizeMB: 2,
  allowedTypes: ['image/*', 'application/pdf', '.doc', '.docx'],
};

// Default validation
export const DEFAULT_VALIDATION: QuestionValidation = {
  rule: 'none',
};

