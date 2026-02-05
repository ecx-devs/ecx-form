"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PublicForm } from "@/entities/form";
import { Question } from "@/entities/question";
import {
  FormAnswers,
  formAnswersToSubmission,
  useSubmitForm,
  useFileUpload,
} from "@/entities/submission";
import {
  Card,
  Button,
  Input,
  TextArea,
  RadioGroup,
  Checkbox,
  Select,
  IconSuccess,
  Spinner,
} from "@/shared/ui";
import {
  cn,
  validateField,
  saveFormDraft,
  getFormDraft,
  getUserIdentifier,
  hasSubmittedForm,
} from "@/shared/lib";

interface PublicFormRendererProps {
  form: PublicForm;
}

export function PublicFormRenderer({ form }: PublicFormRendererProps) {
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    submissionId: string;
    confirmationMessage: string;
  } | null>(null);

  const submitMutation = useSubmitForm(form.id);

  // Check if already submitted
  useEffect(() => {
    if (form.settings.limitToOneResponse && hasSubmittedForm(form.id)) {
      setIsSubmitted(true);
      setSubmissionResult({
        submissionId: "",
        confirmationMessage:
          "You have already submitted a response to this form.",
      });
    }
  }, [form.id, form.settings.limitToOneResponse]);

  // Load draft answers
  useEffect(() => {
    const draft = getFormDraft<FormAnswers>(form.id);
    if (draft) {
      setAnswers(draft);
    }
  }, [form.id]);

  // Auto-save answers
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveFormDraft(form.id, answers);
    }
  }, [answers, form.id]);

  const updateAnswer = useCallback(
    (questionId: string, value: string | string[] | null) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      // Clear error when user starts typing
      setErrors((prev) => {
        const { [questionId]: _, ...rest } = prev;
        return rest;
      });
    },
    [],
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    form.questions.forEach((question) => {
      const value = answers[question.id];
      const validation = validateField(
        value,
        question.required,
        question.validation?.rule || "none",
        question.validation?.errorMessage,
      );

      if (!validation.isValid && validation.error) {
        newErrors[question.id] = validation.error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const result = await submitMutation.mutateAsync({
      answers: formAnswersToSubmission(answers),
      metadata: {
        localStorageKey: getUserIdentifier(),
      },
    });

    setIsSubmitted(true);
    setSubmissionResult(result);
  };

  // Calculate progress
  const progress = form.settings.showProgressBar
    ? (Object.keys(answers).filter((k) => {
        const v = answers[k];
        return v !== null && v !== "" && (!Array.isArray(v) || v.length > 0);
      }).length /
        form.questions.length) *
      100
    : 0;

  if (isSubmitted && submissionResult) {
    return (
      <SubmissionSuccess
        submissionId={submissionResult.submissionId}
        confirmationMessage={submissionResult.confirmationMessage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ecx-blue-50 to-white py-8 px-4">
      {/* Progress Bar */}
      {form.settings.showProgressBar && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
          <motion.div
            className="h-full bg-ecx-blue"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Form Header */}
        <Card className="mb-4 border-t-8 border-t-ecx-blue">
          <h1 className="text-heading-2 font-varela text-ecx-black mb-2">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-body text-gray-600">{form.description}</p>
          )}
          <p className="text-body-sm text-ecx-red mt-4">* Required</p>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          {form.questions.map((question, index) => (
            <QuestionField
              key={question.id}
              question={question}
              value={answers[question.id]}
              error={errors[question.id]}
              onChange={(value) => updateAnswer(question.id, value)}
              index={index}
              formId={form.id}
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            isLoading={submitMutation.isPending}
          >
            Submit
          </Button>
          <button
            onClick={() => setAnswers({})}
            className="text-ecx-blue hover:text-ecx-blue-600 text-body-sm font-medium"
          >
            Clear form
          </button>
        </div>
      </div>
    </div>
  );
}

// Question Field Component
interface QuestionFieldProps {
  question: Question;
  value: string | string[] | null | undefined;
  error?: string;
  onChange: (value: string | string[] | null) => void;
  index: number;
  formId: string;
}

function QuestionField({
  question,
  value,
  error,
  onChange,
  index,
  formId,
}: QuestionFieldProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileUpload = useFileUpload(formId);

  const MAX_FILE_SIZE_MB = 2;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const handleFileUpload = async (file: File) => {
    // Clear previous errors
    setUploadError(null);

    // Validate file size before uploading
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadError(`File is too large (${fileSizeMB}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await fileUpload.mutateAsync({
        file,
        onProgress: (progress) => setUploadProgress(progress),
      });

      // Store as JSON string with path and filename
      const fileData = JSON.stringify({
        fileName: file.name,
        filePath: result.path,
      });
      onChange(fileData);
    } catch (error: any) {
      console.error("File upload failed:", error);
      // Extract error message from response
      const errorMessage = error?.message || "Failed to upload file. Please try again.";
      if (errorMessage.includes("FILE_TOO_LARGE") || errorMessage.includes("size")) {
        setUploadError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      } else if (errorMessage.includes("type") || errorMessage.includes("allowed")) {
        setUploadError("File type not allowed. Please upload an image, PDF, or document.");
      } else {
        setUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Parse file value to get display name
  const getDisplayFileName = () => {
    if (!value || typeof value !== "string") return null;
    try {
      const parsed = JSON.parse(value);
      return parsed.fileName || value;
    } catch {
      return value;
    }
  };

  const displayFileName = getDisplayFileName();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={cn(error && "ring-2 ring-ecx-red")}>
        <div className="mb-4">
          <label className="text-body font-medium text-ecx-black">
            {question.title}
            {question.required && <span className="text-ecx-red ml-1">*</span>}
          </label>
          {question.description && (
            <p className="text-body-sm text-gray-500 mt-1">
              {question.description}
            </p>
          )}
        </div>

        {/* Short Text */}
        {question.type === "short_text" && (
          <Input
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Your answer"
            error={error}
          />
        )}

        {/* Long Text */}
        {question.type === "long_text" && (
          <TextArea
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Your answer"
            error={error}
          />
        )}

        {/* Number */}
        {question.type === "number" && (
          <Input
            type="number"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Your answer"
            error={error}
          />
        )}

        {/* Multiple Choice */}
        {question.type === "multiple_choice" && question.options && (
          <RadioGroup
            name={question.id}
            value={(value as string) || ""}
            onChange={(v) => onChange(v)}
            options={question.options.map((opt) => ({
              value: opt.value,
              label: opt.value,
            }))}
            error={error}
          />
        )}

        {/* Checkboxes */}
        {question.type === "checkbox" && question.options && (
          <div className="space-y-2">
            {question.options.map((option) => {
              const selected = Array.isArray(value) ? value : [];
              const isChecked = selected.includes(option.value);

              return (
                <Checkbox
                  key={option.id}
                  label={option.value}
                  checked={isChecked}
                  onChange={(checked) => {
                    if (checked) {
                      onChange([...selected, option.value]);
                    } else {
                      onChange(selected.filter((v) => v !== option.value));
                    }
                  }}
                />
              );
            })}
            {error && <p className="text-body-sm text-ecx-red mt-1">{error}</p>}
          </div>
        )}

        {/* Dropdown */}
        {question.type === "dropdown" && question.options && (
          <Select
            value={(value as string) || ""}
            onChange={(v) => onChange(v)}
            options={question.options.map((opt) => ({
              value: opt.value,
              label: opt.value,
            }))}
            placeholder="Choose"
            error={error}
          />
        )}

        {/* File Upload */}
        {question.type === "file_upload" && (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              error || uploadError
                ? "border-ecx-red bg-red-50"
                : displayFileName
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 hover:border-ecx-blue hover:bg-ecx-blue-50",
              isUploading && "pointer-events-none opacity-70",
            )}
          >
            <input
              type="file"
              className="hidden"
              id={`file-${question.id}`}
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
            />
            <label htmlFor={`file-${question.id}`} className="cursor-pointer">
              {isUploading ? (
                <div className="space-y-2">
                  <Spinner size="md" />
                  <p className="text-gray-600">
                    Uploading... {Math.round(uploadProgress)}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-ecx-blue h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : displayFileName ? (
                <div className="space-y-1">
                  <p className="text-green-700 font-medium">
                    {displayFileName}
                  </p>
                  <p className="text-body-sm text-gray-400">
                    Click to change file
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-body-sm text-gray-400 mt-1">
                    Max file size: 2MB
                  </p>
                </>
              )}
            </label>
            {uploadError && (
              <p className="text-body-sm text-ecx-red mt-2">{uploadError}</p>
            )}
            {error && !uploadError && (
              <p className="text-body-sm text-ecx-red mt-2">{error}</p>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// Submission Success Component
function SubmissionSuccess({
  submissionId,
  confirmationMessage,
}: {
  submissionId: string;
  confirmationMessage: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ecx-blue-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
          >
            <IconSuccess size={32} className="text-green-500" />
          </motion.div>
          <h2 className="text-heading-3 font-varela text-ecx-black mb-2">
            Response recorded
          </h2>
          <p className="text-body text-gray-600 mb-4">{confirmationMessage}</p>
          {submissionId && (
            <p className="text-body-sm text-gray-500">
              Submission ID:{" "}
              <span className="font-mono text-ecx-blue">{submissionId}</span>
            </p>
          )}
          <div className="mt-6">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Submit another response
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
