import { apiClient, formEndpoints, publicEndpoints } from '@/shared/api';
import { Form, FormListItem, PublicForm, CreateFormInput, UpdateFormInput } from '../model/types';

export const formApi = {
  // Create a new form (returns draft)
  async create(input: CreateFormInput): Promise<Form> {
    return apiClient.post<Form>(formEndpoints.create(), input);
  },

  // List all forms
  async list(): Promise<FormListItem[]> {
    return apiClient.get<FormListItem[]>(formEndpoints.list());
  },

  // Get form for editing (admin view)
  async get(id: string): Promise<Form> {
    return apiClient.get<Form>(formEndpoints.get(id));
  },

  // Update form (auto-save)
  async update(id: string, input: UpdateFormInput): Promise<Form> {
    return apiClient.put<Form>(formEndpoints.update(id), input);
  },

  // Publish form
  async publish(id: string): Promise<Form> {
    return apiClient.patch<Form>(formEndpoints.publish(id));
  },

  // Delete form
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(formEndpoints.delete(id));
  },

  // Get public form (for respondents)
  async getPublic(ecxId: string): Promise<PublicForm> {
    return apiClient.get<PublicForm>(publicEndpoints.getForm(ecxId));
  },
};

