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

function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && appUrl.startsWith("http")) return appUrl;
  return "https://forms.ecx.com.ng";
}

function truncateText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
}

export default async function OpenGraphImage({ params }: Props) {
  const form = await getPublicForm(params.ecxId);
  const title = form?.title || "ECX Forms";
  const description =
    form?.description || "Collecting responses with Engineering Career Expo";
  const themeColor = form?.settings?.themeColor || "#2699e3";
  const logoUrl = `${getAppUrl()}/ecx-forms-logo.png`;
  const titleSize = title.length > 58 ? 50 : title.length > 34 ? 58 : 68;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f8fbff",
          padding: 48,
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderRadius: 34,
            background: "#ffffff",
            border: "3px solid #2699e3",
            boxShadow: "0 26px 80px rgba(39, 46, 75, 0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 30,
              height: "100%",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", flex: 2, background: "#2699e3" }} />
            <div style={{ display: "flex", flex: 1, background: "#fab12d" }} />
            <div style={{ display: "flex", flex: 1, background: "#f2443f" }} />
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "42px 62px 42px 58px",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <img
                src={logoUrl}
                alt="ECX Forms"
                width={92}
                height={92}
                style={{ objectFit: "contain" }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 999,
                  background: "#e6f4fc",
                  border: "2px solid #cce9f9",
                  color: "#175c89",
                  fontSize: 24,
                  fontWeight: 700,
                  padding: "12px 22px",
                }}
              >
                {params.ecxId}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
                maxWidth: 880,
              }}
            >
              <div
                style={{
                  display: "flex",
                  color: "#000000",
                  fontSize: titleSize,
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: 0,
                }}
              >
                {truncateText(title, 78)}
              </div>
              <div
                style={{
                  display: "flex",
                  color: "#424242",
                  fontSize: 27,
                  lineHeight: 1.28,
                  maxWidth: 800,
                }}
              >
                {truncateText(description, 112)}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "#272e4b",
                  fontSize: 25,
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    background: themeColor,
                    border: "3px solid #ffffff",
                    boxShadow: "0 0 0 2px #2699e3",
                  }}
                />
                forms.ecx.com.ng
              </div>
              <div
                style={{
                  display: "flex",
                  color: "#2699e3",
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                ECX Forms
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
