import { Form } from '../entities/Form';
import { FormId } from '../value-objects/FormId';

export interface IFormRepository {
  create(form: Form): Promise<Form>;
  findById(id: FormId): Promise<Form | null>;
  findByEcxId(ecxId: string): Promise<Form | null>;
  findAll(): Promise<Form[]>;
  update(form: Form): Promise<Form>;
  delete(id: FormId): Promise<void>;
  exists(id: FormId): Promise<boolean>;
}

