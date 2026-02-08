"use client";

import { usePublicForm } from "@/entities/form";
import { PublicFormRenderer } from "@/widgets/public-form";
import { Logo, Card, Spinner } from "@/shared/ui";

interface PublicFormPageClientProps {
  ecxId: string;
}

export default function PublicFormPageClient({
  ecxId,
}: PublicFormPageClientProps) {
  // Only match ECX form IDs (ECXF followed by 4 letters)
  const isValidFormId = /^ECXF[A-Z]{4}$/.test(ecxId);

  const {
    data: form,
    isLoading,
    error,
  } = usePublicForm(isValidFormId ? ecxId : undefined);

  if (!isValidFormId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ecx-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <Logo size="lg" className="justify-center mb-6" href="/" />
          <h2 className="text-heading-3 font-varela text-ecx-black mb-2">
            Page not found
          </h2>
          <p className="text-body text-gray-600">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </Card>
      </div>
    );
  }

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
          <Logo size="lg" className="justify-center mb-6" href="/" />
          <h2 className="text-heading-3 font-varela text-ecx-black mb-2">
            Form not available
          </h2>
          <p className="text-body text-gray-600">
            This form is no longer accepting responses or the link is invalid.
          </p>
        </Card>
      </div>
    );
  }

  return <PublicFormRenderer form={form} />;
}
