'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateForm } from '@/entities/form';
import { LoadingOverlay } from '@/shared/ui';

export default function NewFormPage() {
  const router = useRouter();
  const createFormMutation = useCreateForm();

  useEffect(() => {
    // Create a new form immediately
    createFormMutation.mutate(
      { title: 'Untitled Form' },
      {
        onSuccess: (form) => {
          // Redirect to the form editor
          router.replace(`/admin/forms/${form.id}`);
        },
        onError: () => {
          // Redirect back to dashboard on error
          router.replace('/admin');
        },
      }
    );
  }, []);

  return <LoadingOverlay message="Creating your form..." />;
}

