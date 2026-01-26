-- ECX Forms Storage Bucket
-- Migration: Create storage bucket for file uploads
-- Date: 2026-01-26

-- Create storage bucket for form uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'form-uploads',
    'form-uploads',
    true,
    2097152, -- 2MB in bytes
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'form-uploads');

CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'form-uploads');

CREATE POLICY "Allow deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'form-uploads');

