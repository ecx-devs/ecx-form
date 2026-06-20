import { ImageResponse } from "next/og";
import { API_BASE_URL } from "@/shared/config/constants";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface Props {
  params: {
    ecxId: string;
  };
}

async function getPublicForm(ecxId: string) {
  if (!/^ECXF[A-Z]{4}$/.test(ecxId)) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/public/forms/${ecxId}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data || data;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage({ params }: Props) {
  const form = await getPublicForm(params.ecxId);
  const title = form?.title || "ECX Forms";
  const description =
    form?.description || "Collecting responses with Engineering Career Expo";
  const themeColor = form?.settings?.themeColor || "#2699e3";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: `linear-gradient(135deg, ${themeColor} 0%, #ffffff 68%)`,
          padding: 64,
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            background: "rgba(255,255,255,0.92)",
            borderRadius: 28,
            padding: 56,
            border: `8px solid ${themeColor}`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                display: "flex",
                color: themeColor,
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: 0,
              }}
            >
              ECX Forms
            </div>
            <div
              style={{
                display: "flex",
                color: "#111827",
                fontSize: title.length > 52 ? 54 : 68,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: 0,
                maxWidth: 940,
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                color: "#4b5563",
                fontSize: 30,
                lineHeight: 1.35,
                maxWidth: 880,
              }}
            >
              {description.slice(0, 150)}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#111827",
              fontSize: 26,
            }}
          >
            <span>forms.ecx.com.ng</span>
            <span>{params.ecxId}</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
