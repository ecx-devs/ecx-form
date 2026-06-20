// Form Management (Admin)
export const formEndpoints = {
  create: () => "/forms",
  list: () => "/forms",
  get: (id: string) => `/forms/${id}/admin`,
  update: (id: string) => `/forms/${id}`,
  publish: (id: string) => `/forms/${id}/publish`,
  delete: (id: string) => `/forms/${id}`,
  submissions: (id: string) => `/forms/${id}/submissions`,
  export: (id: string, format: "xlsx" | "json" = "xlsx") =>
    `/forms/${id}/export?format=${format}`,
  exportGoogleSheets: (id: string) => `/forms/${id}/export/google-sheets`,
};

// Public Access
export const publicEndpoints = {
  getForm: (ecxId: string) => `/public/forms/${ecxId}`,
  submit: (ecxId: string) => `/public/forms/${ecxId}/submit`,
};

// File Upload
export const uploadEndpoints = {
  getSignedUrl: () => "/upload/sign",
  getPublicUrl: (path: string) =>
    `/upload/url?path=${encodeURIComponent(path)}`,
};
