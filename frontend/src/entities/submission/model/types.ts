export interface SubmissionAnswer {
  questionId: string;
  value: string | string[] | null;
  fileUrl?: string;
}

export interface Submission {
  id: string;
  formId: string;
  answers: SubmissionAnswer[];
  submittedAt: string;
}

export interface SubmissionListResponse {
  submissions: Submission[];
  total: number;
  formTitle: string;
}

export interface SubmitFormInput {
  answers: SubmissionAnswer[];
  metadata?: {
    localStorageKey?: string;
  };
}

export interface SubmitSuccessResponse {
  submissionId: string;
  confirmationMessage: string;
  allowEditing: boolean;
  editUrl?: string;
}

export interface FormAnswers {
  [questionId: string]: string | string[] | null;
}

// Convert FormAnswers to SubmissionAnswer array
export function formAnswersToSubmission(answers: FormAnswers): SubmissionAnswer[] {
  return Object.entries(answers).map(([questionId, value]) => ({
    questionId,
    value,
  }));
}

// Convert SubmissionAnswer array back to FormAnswers
export function submissionToFormAnswers(answers: SubmissionAnswer[]): FormAnswers {
  return answers.reduce((acc, answer) => {
    acc[answer.questionId] = answer.value;
    return acc;
  }, {} as FormAnswers);
}

