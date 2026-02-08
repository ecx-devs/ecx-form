import { Metadata } from "next";
import { API_BASE_URL } from "@/shared/config/constants";
import PublicFormPageClient from "./client";

interface Props {
  params: Promise<{ ecxId: string }>;
}

// Fetch form title for metadata (server-side)
async function getFormTitle(ecxId: string): Promise<string | null> {
  // Only fetch for valid form IDs
  if (!/^ECXF[A-Z]{4}$/.test(ecxId)) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/public/forms/${ecxId}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data?.title || data.title || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ecxId } = await params;
  const formTitle = await getFormTitle(ecxId);

  if (formTitle) {
    return {
      title: formTitle,
      description: `${formTitle}: ECX FORMS`,
      openGraph: {
        title: formTitle,
        description: `${formTitle}: ECX FORMS`,
      },
    };
  }

  return {
    title: "ECX Forms",
    description: "Form not found: ECX FORMS",
  };
}

export default async function PublicFormPage({ params }: Props) {
  const { ecxId } = await params;
  return <PublicFormPageClient ecxId={ecxId} />;
}
