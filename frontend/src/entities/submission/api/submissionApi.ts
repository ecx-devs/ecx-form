import {
  apiClient,
  formEndpoints,
  publicEndpoints,
  uploadEndpoints,
} from "@/shared/api";
import {
  SubmissionListResponse,
  SubmitFormInput,
  SubmitSuccessResponse,
} from "../model/types";

export interface SignedUrlResponse {
  signedUrl: string;
  path: string;
  expiresAt: string;
  maxSizeBytes: number;
}

export const submissionApi = {
  // Submit form response
  async submit(
    formId: string,
    input: SubmitFormInput,
  ): Promise<SubmitSuccessResponse> {
    return apiClient.post<SubmitSuccessResponse>(
      publicEndpoints.submit(formId),
      input,
    );
  },

  // Get all submissions for a form
  async list(formId: string): Promise<SubmissionListResponse> {
    return apiClient.get<SubmissionListResponse>(
      formEndpoints.submissions(formId),
    );
  },

  // Export submissions
  async export(
    formId: string,
    format: "xlsx" | "json" = "xlsx",
  ): Promise<Blob> {
    return apiClient.download(formEndpoints.export(formId, format));
  },

  // Get signed URL for file upload
  async getSignedUploadUrl(
    formId: string,
    filename: string,
    contentType: string,
    fileSize: number,
  ): Promise<SignedUrlResponse> {
    return apiClient.post<SignedUrlResponse>(uploadEndpoints.getSignedUrl(), {
      formId,
      filename,
      contentType,
      fileSize,
    });
  },

  // Upload file to signed URL
  async uploadFile(
    signedUrl: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error("Upload failed"));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("PUT", signedUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  },
};
