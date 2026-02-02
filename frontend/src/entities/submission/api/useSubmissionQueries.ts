"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { submissionApi } from "./submissionApi";
import { SubmitFormInput } from "../model/types";
import { markFormAsSubmitted, clearFormDraft } from "@/shared/lib/storage";
import toast from "react-hot-toast";

export const submissionKeys = {
  all: ["submissions"] as const,
  list: (formId: string) => [...submissionKeys.all, "list", formId] as const,
};

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
    onSuccess: (blob, { format }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `responses.${format}`;
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
