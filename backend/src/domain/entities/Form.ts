import { Question } from './Question';
import { FormSettings, FormSettingsProps } from '../value-objects/FormSettings';
import { FormId } from '../value-objects/FormId';

export type FormStatus = 'draft' | 'published';

export interface FormProps {
  id: FormId;
  title: string;
  description?: string;
  questions: Question[];
  settings: FormSettings;
  status: FormStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Form {
  private readonly _id: FormId;
  private _title: string;
  private _description?: string;
  private _questions: Question[];
  private _settings: FormSettings;
  private _status: FormStatus;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: FormProps) {
    this._id = props.id;
    this._title = props.title;
    this._description = props.description;
    this._questions = props.questions;
    this._settings = props.settings;
    this._status = props.status;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(title: string, description?: string): Form {
    const now = new Date();
    return new Form({
      id: FormId.generate(),
      title,
      description,
      questions: [],
      settings: FormSettings.default(),
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    });
  }

  // Getters
  get id(): FormId {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get description(): string | undefined {
    return this._description;
  }

  get questions(): Question[] {
    return [...this._questions];
  }

  get settings(): FormSettings {
    return this._settings;
  }

  get status(): FormStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get isPublished(): boolean {
    return this._status === 'published';
  }

  get publicUrl(): string | null {
    return this.isPublished ? `/forms/${this._id.value}` : null;
  }

  // Mutations
  updateTitle(title: string): void {
    if (!title.trim()) {
      throw new Error('Form title cannot be empty');
    }
    this._title = title;
    this._updatedAt = new Date();
  }

  updateDescription(description?: string): void {
    this._description = description;
    this._updatedAt = new Date();
  }

  addQuestion(question: Question): void {
    this._questions.push(question);
    this._updatedAt = new Date();
  }

  updateQuestion(questionId: string, updates: Partial<Question>): void {
    const index = this._questions.findIndex(q => q.id === questionId);
    if (index === -1) {
      throw new Error(`Question with id ${questionId} not found`);
    }
    this._questions[index] = { ...this._questions[index], ...updates };
    this._updatedAt = new Date();
  }

  removeQuestion(questionId: string): void {
    const index = this._questions.findIndex(q => q.id === questionId);
    if (index === -1) {
      throw new Error(`Question with id ${questionId} not found`);
    }
    this._questions.splice(index, 1);
    this._updatedAt = new Date();
  }

  reorderQuestions(questionIds: string[]): void {
    const reordered: Question[] = [];
    for (const id of questionIds) {
      const question = this._questions.find(q => q.id === id);
      if (!question) {
        throw new Error(`Question with id ${id} not found`);
      }
      reordered.push(question);
    }
    this._questions = reordered;
    this._updatedAt = new Date();
  }

  duplicateQuestion(questionId: string): Question {
    const question = this._questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error(`Question with id ${questionId} not found`);
    }
    const duplicated: Question = {
      ...question,
      id: crypto.randomUUID(),
    };
    const index = this._questions.findIndex(q => q.id === questionId);
    this._questions.splice(index + 1, 0, duplicated);
    this._updatedAt = new Date();
    return duplicated;
  }

  updateSettings(settings: Partial<FormSettingsProps>): void {
    this._settings = FormSettings.merge(this._settings, settings);
    this._updatedAt = new Date();
  }

  publish(): void {
    if (!this._questions.some((question) => question.type !== 'section')) {
      throw new Error('Cannot publish a form without questions');
    }
    this._status = 'published';
    this._updatedAt = new Date();
  }

  unpublish(): void {
    this._status = 'draft';
    this._updatedAt = new Date();
  }

  toJSON(): Omit<FormProps, 'id'> & { id: string } {
    return {
      id: this._id.value,
      title: this._title,
      description: this._description,
      questions: this._questions,
      settings: this._settings,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}


