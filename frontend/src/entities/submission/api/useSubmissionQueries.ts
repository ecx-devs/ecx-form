"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { submissionApi } from "./submissionApi";
import { SubmitFormInput } from "../model/types";
import { Form, formKeys, useFormStore } from "@/entities/form";
import { markFormAsSubmitted, clearFormDraft } from "@/shared/lib/storage";
import toast from "react-hot-toast";

export const submissionKeys = {
  all: ["submissions"] as const,
  list: (formId: string) => [...submissionKeys.all, "list", formId] as const,
};

function toSafeFilename(value: string): string {
  const safeValue = value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return safeValue || "responses";
}

// Get submissions for a form
export function useSubmissions(formId: string | undefined) {
  return useQuery({
    queryKey: submissionKeys.list(formId!),
    queryFn: () => submissionApi.list(formId!),
    enabled: !!formId,
  });
}

// Submit form mutation
export function useSubmitForm(formId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitFormInput) => submissionApi.submit(formId, input),
    onSuccess: (response) => {
      // Mark form as submitted in local storage
      markFormAsSubmitted(formId);
      // Clear the draft
      clearFormDraft(formId);
      // Invalidate submissions query
      queryClient.invalidateQueries({ queryKey: submissionKeys.list(formId) });
      return response;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit form");
    },
  });
}

// Export submissions mutation
export function useExportSubmissions() {
  return useMutation({
    mutationFn: ({
      formId,
      format,
    }: {
      formId: string;
      format: "xlsx" | "json";
    }) => submissionApi.export(formId, format),
    onSuccess: ({ blob, filename }, { formId, format }) => {
      const currentForm = useFormStore.getState().currentForm;
      const fallbackTitle =
        currentForm?.id === formId ? currentForm.title : "responses";
      const downloadFilename =
        filename || `${toSafeFilename(fallbackTitle)}.${format}`;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Export downloaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export submissions");
    },
  });
}

export function useExportSubmissionsToGoogleSheets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ formId }: { formId: string }) =>
      submissionApi.exportToGoogleSheets(formId),
    onSuccess: (result, { formId }) => {
      const currentForm = useFormStore.getState().currentForm;
      const googleSheetsSettings = {
        googleSheetsSpreadsheetId: result.spreadsheetId,
        googleSheetsUrl: result.url,
        googleSheetsTitle: result.title,
        googleSheetsLinkedAt:
          currentForm?.id === formId
            ? currentForm.settings.googleSheetsLinkedAt ?? result.syncedAt
            : result.syncedAt,
        googleSheetsLastSyncedAt: result.syncedAt,
      };

      window.open(result.url, "_blank", "noopener,noreferrer");
      queryClient.setQueryData<Form | undefined>(
        formKeys.detail(formId),
        (form) =>
          form
            ? {
                ...form,
                settings: {
                  ...form.settings,
                  ...googleSheetsSettings,
                },
              }
            : form,
      );

      if (currentForm?.id === formId) {
        useFormStore.getState().updateSettings(googleSheetsSettings);
      }

      queryClient.invalidateQueries({ queryKey: formKeys.detail(formId) });
      toast.success("Google Sheet ready");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export to Google Sheets");
    },
  });
}

// File upload mutation
export function useFileUpload(formId: string) {
  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => {
      // Get signed URL
      const { signedUrl, path } = await submissionApi.getSignedUploadUrl(
        formId,
        file.name,
        file.type,
        file.size,
      );

      // Upload file
      await submissionApi.uploadFile(signedUrl, file, onProgress);

      return { path };
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload file");
    },
  });
}
