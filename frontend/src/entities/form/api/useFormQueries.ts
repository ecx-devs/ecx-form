'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formApi } from './formApi';
import { CreateFormInput, UpdateFormInput } from '../model/types';
import { useFormStore } from '../model/store';
import toast from 'react-hot-toast';

export const formKeys = {
  all: ['forms'] as const,
  lists: () => [...formKeys.all, 'list'] as const,
  list: () => [...formKeys.lists()] as const,
  details: () => [...formKeys.all, 'detail'] as const,
  detail: (id: string) => [...formKeys.details(), id] as const,
  public: (id: string) => ['public-form', id] as const,
};

// List all forms
export function useFormList() {
  const setForms = useFormStore((state) => state.setForms);

  return useQuery({
    queryKey: formKeys.list(),
    queryFn: async () => {
      const forms = await formApi.list();
      setForms(forms);
      return forms;
    },
  });
}

// Get single form for editing
export function useForm(id: string | undefined) {
  const setCurrentForm = useFormStore((state) => state.setCurrentForm);

  return useQuery({
    queryKey: formKeys.detail(id!),
    queryFn: async () => {
      const form = await formApi.get(id!);
      setCurrentForm(form);
      return form;
    },
    enabled: !!id,
  });
}

// Get public form
export function usePublicForm(ecxId: string | undefined) {
  return useQuery({
    queryKey: formKeys.public(ecxId!),
    queryFn: () => formApi.getPublic(ecxId!),
    enabled: !!ecxId,
    retry: false,
  });
}

// Create form mutation
export function useCreateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFormInput) => formApi.create(input),
    onSuccess: (form) => {
      queryClient.invalidateQueries({ queryKey: formKeys.lists() });
      toast.success('Form created successfully');
      return form;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create form');
    },
  });
}

// Update form mutation (auto-save)
export function useUpdateForm() {
  const queryClient = useQueryClient();
  const setSaving = useFormStore((state) => state.setSaving);

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFormInput }) =>
      formApi.update(id, input),
    onMutate: () => {
      setSaving(true);
    },
    onSuccess: (form) => {
      queryClient.setQueryData(formKeys.detail(form.id), form);
      queryClient.invalidateQueries({ queryKey: formKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save changes');
    },
    onSettled: () => {
      setSaving(false);
    },
  });
}

// Publish form mutation
export function usePublishForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => formApi.publish(id),
    onSuccess: (form) => {
      queryClient.setQueryData(formKeys.detail(form.id), form);
      queryClient.invalidateQueries({ queryKey: formKeys.lists() });
      toast.success('Form published successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to publish form');
    },
  });
}

// Delete form mutation
export function useDeleteForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => formApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: formKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: formKeys.lists() });
      toast.success('Form deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete form');
    },
  });
}

