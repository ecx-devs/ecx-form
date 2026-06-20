import { Metadata } from "next";
import { headers } from "next/headers";
import { API_BASE_URL, APP_URL } from "@/shared/config/constants";
import PublicFormPageClient from "./client";

interface Props {
  params: Promise<{ ecxId: string }>;
}

interface FormMetadata {
  title: string;
  description?: string;
}

// Fetch form metadata server-side for title and social previews.
async function getFormMetadata(ecxId: string): Promise<FormMetadata | null> {
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
    const form = data.data || data;
    return form?.title
      ? {
          title: form.title,
          description: form.description,
        }
      : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ecxId } = await params;
  const form = await getFormMetadata(ecxId);
  const requestHeaders = headers();
  const host =
    requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") || "https";
  const appUrl = host ? `${protocol}://${host}` : APP_URL.replace(/\/$/, "");

  if (form?.title) {
    const description = form.description || `${form.title}: ECX FORMS`;
    const imageUrl = `${appUrl}/${ecxId}/opengraph-image`;
    return {
      title: form.title,
      description,
      openGraph: {
        title: form.title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: form.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: form.title,
        description,
        images: [imageUrl],
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
