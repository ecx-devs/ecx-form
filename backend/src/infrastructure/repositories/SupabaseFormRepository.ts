import { SupabaseClient } from '@supabase/supabase-js';
import { Form, FormProps, FormStatus } from '../../domain/entities/Form';
import { Question } from '../../domain/entities/Question';
import { IFormRepository } from '../../domain/repositories/IFormRepository';
import { FormId } from '../../domain/value-objects/FormId';
import { FormSettings, FormSettingsProps } from '../../domain/value-objects/FormSettings';
import { TABLES } from '../config/supabase';

interface FormRow {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
  settings: FormSettingsProps;
  status: FormStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export class SupabaseFormRepository implements IFormRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(form: Form): Promise<Form> {
    const json = form.toJSON();
    
    const row: Omit<FormRow, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string } = {
      id: json.id,
      title: json.title,
      description: json.description || null,
      questions: json.questions,
      settings: json.settings.toJSON ? json.settings.toJSON() : json.settings,
      status: json.status,
    };

    const { data, error } = await this.supabase
      .from(TABLES.FORMS)
      .insert(row)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create form: ${error.message}`);
    }

    return this.toDomain(data);
  }

  async findById(id: FormId): Promise<Form | null> {
    const { data, error } = await this.supabase
      .from(TABLES.FORMS)
      .select('*')
      .eq('id', id.value)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch form: ${error.message}`);
    }

    return this.toDomain(data);
  }

  async findByEcxId(ecxId: string): Promise<Form | null> {
    return this.findById(FormId.fromString(ecxId));
  }

  async findAll(): Promise<Form[]> {
    const { data, error } = await this.supabase
      .from(TABLES.FORMS)
      .select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch forms: ${error.message}`);
    }

    return data.map(row => this.toDomain(row));
  }

  async update(form: Form): Promise<Form> {
    const json = form.toJSON();

    const row: Partial<FormRow> = {
      title: json.title,
      description: json.description || null,
      questions: json.questions,
      settings: json.settings.toJSON ? json.settings.toJSON() : json.settings,
      status: json.status,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from(TABLES.FORMS)
      .update(row)
      .eq('id', json.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update form: ${error.message}`);
    }

    return this.toDomain(data);
  }

  async delete(id: FormId): Promise<void> {
    const { error } = await this.supabase
      .from(TABLES.FORMS)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id.value);

    if (error) {
      throw new Error(`Failed to delete form: ${error.message}`);
    }
  }

  async exists(id: FormId): Promise<boolean> {
    const { count, error } = await this.supabase
      .from(TABLES.FORMS)
      .select('*', { count: 'exact', head: true })
      .eq('id', id.value);

    if (error) {
      throw new Error(`Failed to check form existence: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  private toDomain(row: FormRow): Form {
    const props: FormProps = {
      id: FormId.fromString(row.id),
      title: row.title,
      description: row.description || undefined,
      questions: row.questions || [],
      settings: FormSettings.create(row.settings),
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new Form(props);
  }
}

