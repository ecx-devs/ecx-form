// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Form Configuration
export const MAX_FILE_SIZE_MB = 2;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ECX Branding
export const BRAND = {
  name: 'ECX Forms',
  fullName: 'Engineering Career Expo Forms',
  tagline: 'Collect responses effortlessly',
  website: 'https://ecx.com.ng',
  formsUrl: 'https://forms.ecx.com.ng',
} as const;

// ECX Colors (from brand guide)
export const COLORS = {
  primary: {
    blue: '#2699e3',
    yellow: '#fab12d',
    red: '#f2443f',
  },
  secondary: {
    blue: '#272e4b',
    cream: '#f4e1ce',
    maroon: '#802807',
    purple: '#6259cd',
    teal: '#00b29a',
    coral: '#fc8a7a',
  },
  null: {
    black: '#000000',
    gray: '#424242',
    white: '#ffffff',
  },
} as const;

// Question Types
export const QUESTION_TYPES = {
  short_text: { label: 'Short answer', icon: 'short-text' },
  long_text: { label: 'Paragraph', icon: 'long-text' },
  number: { label: 'Number', icon: 'number' },
  multiple_choice: { label: 'Multiple choice', icon: 'radio' },
  checkbox: { label: 'Checkboxes', icon: 'checkbox' },
  dropdown: { label: 'Dropdown', icon: 'dropdown' },
  file_upload: { label: 'File upload', icon: 'file' },
} as const;

export type QuestionType = keyof typeof QUESTION_TYPES;

// Validation Rules
export const VALIDATION_RULES = {
  none: { label: 'No validation', pattern: null },
  email: { label: 'Email address', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  number: { label: 'Number', pattern: /^-?\d*\.?\d+$/ },
  url: { label: 'URL', pattern: /^https?:\/\/.+/ },
  phone: { label: 'Phone number', pattern: /^\+?[\d\s-()]+$/ },
} as const;

export type ValidationRule = keyof typeof VALIDATION_RULES;

// Local Storage Keys
export const STORAGE_KEYS = {
  formDraft: (formId: string) => `ecx_form_draft_${formId}`,
  submissionKey: (formId: string) => `ecx_submitted_${formId}`,
  userIdentifier: 'ecx_user_identifier',
} as const;

