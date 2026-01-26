import { Submission } from '../entities/Submission';
import { SubmissionId } from '../value-objects/SubmissionId';

export interface ISubmissionRepository {
  create(submission: Submission): Promise<Submission>;
  findById(id: SubmissionId): Promise<Submission | null>;
  findByFormId(formId: string): Promise<Submission[]>;
  countByFormId(formId: string): Promise<number>;
  existsByLocalStorageKey(formId: string, localStorageKey: string): Promise<boolean>;
  delete(id: SubmissionId): Promise<void>;
}

