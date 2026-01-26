-- ECX Forms Database Schema
-- Migration: Initial Schema
-- Date: 2026-01-26

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Forms table
CREATE TABLE IF NOT EXISTS forms (
    id VARCHAR(8) PRIMARY KEY CHECK (id ~ '^ECXF[A-Z]{4}$'),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    settings JSONB NOT NULL DEFAULT '{
        "limitToOneResponse": false,
        "allowResponseEditing": false,
        "confirmationMessage": "Your response has been recorded.",
        "showProgressBar": true,
        "shuffleQuestions": false
    }'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(13) PRIMARY KEY CHECK (id ~ '^ECXF[A-Z]{4}-\d{4}$'),
    form_id VARCHAR(8) NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_updated_at ON forms(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_metadata_ls_key ON submissions((metadata->>'localStorageKey'));

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (can be restricted later with auth)
CREATE POLICY "Allow all operations on forms" ON forms FOR ALL USING (true);
CREATE POLICY "Allow all operations on submissions" ON submissions FOR ALL USING (true);

-- Comments
COMMENT ON TABLE forms IS 'Stores form definitions with questions and settings';
COMMENT ON TABLE submissions IS 'Stores form submission responses';
COMMENT ON COLUMN forms.id IS 'Unique form ID in format ECXFXXXX';
COMMENT ON COLUMN forms.questions IS 'JSON array of question objects';
COMMENT ON COLUMN forms.settings IS 'Form settings like limitToOneResponse, confirmationMessage';
COMMENT ON COLUMN submissions.id IS 'Unique submission ID in format ECXFXXXX-0000';
COMMENT ON COLUMN submissions.metadata IS 'Additional metadata like userAgent, ipAddress, localStorageKey';

