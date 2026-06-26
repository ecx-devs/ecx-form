import { SupabaseClient } from '@supabase/supabase-js';
import { BUCKETS } from '../config/supabase';

export interface SignedUrlResult {
  signedUrl: string;
  path: string;
  expiresAt: Date;
}

export interface UploadConfig {
  maxSizeMB: number;
  allowedMimeTypes: string[];
}

const DEFAULT_CONFIG: UploadConfig = {
  maxSizeMB: 2,
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
};

export class FileUploadService {
  private config: UploadConfig;

  constructor(
    private readonly supabase: SupabaseClient,
    config?: Partial<UploadConfig>
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async getSignedUploadUrl(
    formId: string,
    filename: string,
    contentType: string
  ): Promise<SignedUrlResult> {
    // Validate file type
    if (!this.isAllowedMimeType(contentType)) {
      throw new FileTypeNotAllowedError(
        `File type "${contentType}" is not allowed. Allowed types: ${this.config.allowedMimeTypes.join(', ')}`
      );
    }

    // Generate unique path
    const timestamp = Date.now();
    const sanitizedFilename = this.sanitizeFilename(filename);
    const path = `${formId}/${timestamp}_${sanitizedFilename}`;

    // Create signed URL for upload
    const { data, error } = await this.supabase.storage
      .from(BUCKETS.UPLOADS)
      .createSignedUploadUrl(path);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return {
      signedUrl: data.signedUrl,
      path,
      expiresAt,
    };
  }

  async getPublicUrl(path: string): Promise<string> {
    const { data } = this.supabase.storage
      .from(BUCKETS.UPLOADS)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async getSignedDownloadUrl(path: string): Promise<string> {
    const expiresInSeconds =
      Number(process.env.SIGNED_FILE_URL_EXPIRES_SECONDS) || 60 * 60 * 24 * 30;
    const { data, error } = await this.supabase.storage
      .from(BUCKETS.UPLOADS)
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      throw new Error(`Failed to create signed download URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  async deleteFile(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(BUCKETS.UPLOADS)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  getMaxFileSizeBytes(): number {
    return this.config.maxSizeMB * 1024 * 1024;
  }

  getAllowedMimeTypes(): string[] {
    return [...this.config.allowedMimeTypes];
  }

  private isAllowedMimeType(contentType: string): boolean {
    return this.config.allowedMimeTypes.some(allowed => {
      if (allowed.endsWith('/*')) {
        const prefix = allowed.slice(0, -1);
        return contentType.startsWith(prefix);
      }
      return contentType === allowed;
    });
  }

  private sanitizeFilename(filename: string): string {
    // Remove or replace dangerous characters
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .slice(0, 100);
  }
}

export class FileTypeNotAllowedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileTypeNotAllowedError';
  }
}

export class FileTooLargeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileTooLargeError';
  }
}

