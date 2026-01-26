import { SubmissionAnswer, SubmissionMetadata } from '../../domain/entities/Submission';

// Request DTOs
export interface CreateSubmissionDTO {
  formId: string;
  answers: SubmissionAnswer[];
  metadata: SubmissionMetadata;
}

// Response DTOs
export interface SubmissionResponseDTO {
  id: string;
  formId: string;
  answers: SubmissionAnswer[];
  submittedAt: string;
}

export interface SubmissionListResponseDTO {
  submissions: SubmissionResponseDTO[];
  total: number;
  formTitle: string;
}

export interface SubmitSuccessDTO {
  submissionId: string;
  confirmationMessage: string;
  allowEditing: boolean;
  editUrl?: string;
}

