import { v4 as uuidv4 } from 'uuid';
import {
  Question,
  QuestionType,
  QuestionOption,
  QUESTION_TYPE_CONFIG,
  DEFAULT_FILE_CONFIG,
  DEFAULT_VALIDATION,
} from './types';

export function createQuestion(type: QuestionType, order: number): Question {
  const config = QUESTION_TYPE_CONFIG[type];

  const base: Question = {
    id: uuidv4(),
    type,
    title: config.defaultTitle,
    required: false,
    order,
  };

  // Add options for choice-based questions
  if (config.hasOptions) {
    base.options = [createOption(0)];
  }

  // Add file config for file upload
  if (config.hasFileConfig) {
    base.fileConfig = { ...DEFAULT_FILE_CONFIG };
  }

  // Add default validation for number type
  if (type === 'number') {
    base.validation = {
      rule: 'number',
      errorMessage: 'Please enter a valid number',
    };
  }

  return base;
}

export function createSection(order: number): Question {
  return createQuestion('section', order);
}

export function createOption(order: number, value?: string): QuestionOption {
  return {
    id: uuidv4(),
    value: value || `Option ${order + 1}`,
    order,
  };
}

export function duplicateQuestion(question: Question, newOrder: number): Question {
  return {
    ...question,
    id: uuidv4(),
    order: newOrder,
    options: question.options?.map((opt, index) => ({
      ...opt,
      id: uuidv4(),
      order: index,
    })),
  };
}

export function addOptionToQuestion(question: Question): Question {
  if (!question.options) return question;

  const newOption = createOption(question.options.length);
  return {
    ...question,
    options: [...question.options, newOption],
  };
}

export function removeOptionFromQuestion(
  question: Question,
  optionId: string
): Question {
  if (!question.options || question.options.length <= 1) return question;

  return {
    ...question,
    options: question.options
      .filter((opt) => opt.id !== optionId)
      .map((opt, index) => ({ ...opt, order: index })),
  };
}

export function updateOptionInQuestion(
  question: Question,
  optionId: string,
  value: string
): Question {
  if (!question.options) return question;

  return {
    ...question,
    options: question.options.map((opt) =>
      opt.id === optionId ? { ...opt, value } : opt
    ),
  };
}

