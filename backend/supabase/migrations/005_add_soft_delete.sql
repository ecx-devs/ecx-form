-- Add soft delete support to forms table
ALTER TABLE forms ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index for efficient filtering of non-deleted forms
CREATE INDEX idx_forms_deleted_at ON forms (deleted_at) WHERE deleted_at IS NULL;
