"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm, useFormStore, useUpdateForm } from "@/entities/form";
import {
  useSubmissions,
  useExportSubmissions,
  useExportSubmissionsToGoogleSheets,
} from "@/entities/submission";
import { FormBuilderHeader, FormBuilderCanvas } from "@/widgets/form-builder";
import { FormSettingsPanel } from "@/features/form-settings";
import { ResponsesView } from "@/features/form-responses";
import {
  Tabs,
  TabList,
  TabTrigger,
  TabContent,
  Spinner,
  Card,
  SkeletonForm,
} from "@/shared/ui";

export default function FormEditorPage() {
  const params = useParams();
  const formId = params.id as string;

  const { data: form, isLoading, error } = useForm(formId);
  const { currentForm, updateSettings } = useFormStore();
  const updateFormMutation = useUpdateForm();
  const { data: submissionsData, isLoading: isLoadingSubmissions } =
    useSubmissions(formId);
  const exportMutation = useExportSubmissions();
  const googleSheetsExportMutation = useExportSubmissionsToGoogleSheets();

  const handleToggleAcceptingResponses = (accepting: boolean) => {
    if (!currentForm) return;

    // Update local state
    updateSettings({ acceptingResponses: accepting });

    // Save to server
    updateFormMutation.mutate({
      id: currentForm.id,
      input: {
        settings: { ...currentForm.settings, acceptingResponses: accepting },
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Skeleton Header */}
        <div className="bg-white border-b border-gray-200 h-16" />
        <div className="bg-white border-b border-gray-200 h-12" />
        <div className="max-w-3xl mx-auto py-6 px-4">
          <SkeletonForm fields={4} />
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-ecx-red-50 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-ecx-red"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-heading-3 font-varela text-ecx-black mb-2">
            Form not found
          </h2>
          <p className="text-body text-gray-600">
            The form you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <FormBuilderHeader />

      <Tabs defaultTab="questions" className="max-w-6xl mx-auto">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-20">
          <div className="max-w-3xl mx-auto">
            <TabList>
              <TabTrigger value="questions">Questions</TabTrigger>
              <TabTrigger value="responses">
                Responses
                {submissionsData && submissionsData.total > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-ecx-blue text-white text-caption font-medium rounded-full">
                    {submissionsData.total}
                  </span>
                )}
              </TabTrigger>
              <TabTrigger value="settings">Settings</TabTrigger>
            </TabList>
          </div>
        </div>

        {/* Questions Tab */}
        <TabContent value="questions" className="py-6">
          <FormBuilderCanvas />
        </TabContent>

        {/* Responses Tab */}
        <TabContent value="responses" className="py-6">
          <div className="max-w-3xl mx-auto px-4">
            <ResponsesView
              submissions={submissionsData?.submissions || []}
              questions={currentForm?.questions || []}
              isLoading={isLoadingSubmissions}
              onExport={(format) => exportMutation.mutate({ formId, format })}
              onExportGoogleSheets={() =>
                googleSheetsExportMutation.mutate({ formId })
              }
              isExporting={exportMutation.isPending}
              isExportingGoogleSheets={googleSheetsExportMutation.isPending}
              acceptingResponses={
                currentForm?.settings.acceptingResponses ?? true
              }
              onToggleAcceptingResponses={handleToggleAcceptingResponses}
            />
          </div>
        </TabContent>

        {/* Settings Tab */}
        <TabContent value="settings" className="py-6">
          <div className="max-w-2xl mx-auto px-4">
            <FormSettingsPanel />
          </div>
        </TabContent>
      </Tabs>
    </div>
  );
}
