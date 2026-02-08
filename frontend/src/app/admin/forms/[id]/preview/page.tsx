"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "@/entities/form";
import { PublicFormRenderer } from "@/widgets/public-form";
import { Logo, Card, Spinner, Button, IconChevronLeft } from "@/shared/ui";

export default function FormPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const { data: form, isLoading, error } = useForm(formId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ecx-blue-50 to-white flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ecx-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <Logo size="lg" className="justify-center mb-6" href="/admin" />
          <h2 className="text-heading-3 font-varela text-ecx-black mb-2">
            Form not found
          </h2>
          <p className="text-body text-gray-600">
            The form you&apos;re trying to preview doesn&apos;t exist.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin")}
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Convert admin form to public form format for the renderer
  const publicForm = {
    id: form.id,
    title: form.title,
    description: form.description,
    questions: form.questions,
    settings: {
      limitToOneResponse: form.settings.limitToOneResponse,
      allowResponseEditing: form.settings.allowResponseEditing,
      showProgressBar: form.settings.showProgressBar,
    },
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Preview Banner */}
      <div className="sticky top-0 z-50 bg-ecx-yellow text-ecx-black py-2 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 hover:bg-black/10 rounded transition-colors"
            >
              <IconChevronLeft size={20} />
            </button>
            <span className="font-medium">Preview Mode</span>
            {form.status === "draft" && (
              <span className="px-2 py-0.5 bg-black/10 text-sm rounded">
                Draft
              </span>
            )}
          </div>
          <p className="text-sm">Submissions in preview mode are not saved</p>
        </div>
      </div>

      {/* Form Preview */}
      <PublicFormRenderer form={publicForm} isPreview />
    </div>
  );
}
