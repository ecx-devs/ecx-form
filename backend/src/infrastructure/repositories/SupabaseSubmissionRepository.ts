import { SupabaseClient } from '@supabase/supabase-js';
import { Submission, SubmissionAnswer, SubmissionMetadata, SubmissionProps } from '../../domain/entities/Submission';
import { ISubmissionRepository } from '../../domain/repositories/ISubmissionRepository';
import { SubmissionId } from '../../domain/value-objects/SubmissionId';
import { TABLES } from '../config/supabase';

interface SubmissionRow {
  id: string;
  form_id: string;
  answers: SubmissionAnswer[];
  submitted_at: string;
  metadata: SubmissionMetadata;
}

export class SupabaseSubmissionRepository implements ISubmissionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(submission: Submission): Promise<Submission> {
    const json = submission.toJSON();

    const row: Omit<SubmissionRow, 'submitted_at'> & { submitted_at?: string } = {
      id: json.id,
      form_id: json.formId,
      answers: json.answers,
      metadata: json.metadata,
    };

    const { data, error } = await this.supabase
      .from(TABLES.SUBMISSIONS)
      .insert(row)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create submission: ${error.message}`);
    }

    return this.toDomain(data);
  }

  async findById(id: SubmissionId): Promise<Submission | null> {
    const { data, error } = await this.supabase
      .from(TABLES.SUBMISSIONS)
      .select('*')
      .eq('id', id.value)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch submission: ${error.message}`);
    }

    return this.toDomain(data);
  }

  async findByFormId(formId: string): Promise<Submission[]> {
    const { data, error } = await this.supabase
      .from(TABLES.SUBMISSIONS)
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch submissions: ${error.message}`);
    }

    return data.map(row => this.toDomain(row));
  }

  async countByFormId(formId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from(TABLES.SUBMISSIONS)
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId);

    if (error) {
      throw new Error(`Failed to count submissions: ${error.message}`);
    }

    return count ?? 0;
  }

  async existsByLocalStorageKey(formId: string, localStorageKey: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from(TABLES.SUBMISSIONS)
      .select('*', { count: 'exact', head: true })
      .eq('form_id', formId)
      .eq('metadata->>localStorageKey', localStorageKey);

    if (error) {
      throw new Error(`Failed to check submission: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  async delete(id: SubmissionId): Promise<void> {
    const { error } = await this.supabase
      .from(TABLES.SUBMISSIONS)
      .delete()
      .eq('id', id.value);

    if (error) {
      throw new Error(`Failed to delete submission: ${error.message}`);
    }
  }

  private toDomain(row: SubmissionRow): Submission {
    const props: SubmissionProps = {
      id: SubmissionId.fromString(row.id),
      formId: row.form_id,
      answers: row.answers || [],
      submittedAt: new Date(row.submitted_at),
      metadata: row.metadata || {},
    };

    return new Submission(props);
  }
}

