export type QuestionType =
  | 'section'
  | 'short_text'
  | 'long_text'
  | 'number'
  | 'multiple_choice'
  | 'checkbox'
  | 'dropdown'
  | 'file_upload';

export type ValidationRule =
  | 'none'
  | 'email'
  | 'number'
  | 'url'
  | 'phone';

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

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  options?: QuestionOption[];
  validation?: QuestionValidation;
  fileConfig?: {
    maxSizeMB: number;
    allowedTypes?: string[];
  };
}

export class QuestionFactory {
  static create(
    type: QuestionType,
    title: string,
    order: number,
    options?: Partial<Question>
  ): Question {
    const base: Question = {
      id: crypto.randomUUID(),
      type,
      title,
      required: false,
      order,
      ...options,
    };

    switch (type) {
      case 'multiple_choice':
      case 'checkbox':
      case 'dropdown':
        return {
          ...base,
          options: options?.options || [
            { id: crypto.randomUUID(), value: 'Option 1', order: 0 },
          ],
        };
      case 'file_upload':
        return {
          ...base,
          fileConfig: options?.fileConfig || {
            maxSizeMB: 2,
            allowedTypes: ['image/*', 'application/pdf', '.doc', '.docx'],
          },
        };
      case 'number':
        return {
          ...base,
          validation: options?.validation || {
            rule: 'number',
            errorMessage: 'Please enter a valid number',
          },
        };
      default:
        return base;
    }
  }

  static createShortText(title: string, order: number): Question {
    return this.create('short_text', title, order);
  }

  static createLongText(title: string, order: number): Question {
    return this.create('long_text', title, order);
  }

  static createNumber(title: string, order: number): Question {
    return this.create('number', title, order);
  }

  static createMultipleChoice(
    title: string,
    order: number,
    options: string[]
  ): Question {
    return this.create('multiple_choice', title, order, {
      options: options.map((value, index) => ({
        id: crypto.randomUUID(),
        value,
        order: index,
      })),
    });
  }

  static createCheckbox(
    title: string,
    order: number,
    options: string[]
  ): Question {
    return this.create('checkbox', title, order, {
      options: options.map((value, index) => ({
        id: crypto.randomUUID(),
        value,
        order: index,
      })),
    });
  }

  static createDropdown(
    title: string,
    order: number,
    options: string[]
  ): Question {
    return this.create('dropdown', title, order, {
      options: options.map((value, index) => ({
        id: crypto.randomUUID(),
        value,
        order: index,
      })),
    });
  }

  static createFileUpload(
    title: string,
    order: number,
    config?: { maxSizeMB?: number; allowedTypes?: string[] }
  ): Question {
    return this.create('file_upload', title, order, {
      fileConfig: {
        maxSizeMB: config?.maxSizeMB || 2,
        allowedTypes: config?.allowedTypes,
      },
    });
  }
}
