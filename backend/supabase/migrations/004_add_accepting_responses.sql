-- ECX Forms Database Schema
-- Migration: Add acceptingResponses setting
-- Date: 2026-02-08

-- Update the default settings to include acceptingResponses
-- This will only affect new forms, existing forms will get acceptingResponses = true on next update

-- Update existing forms to have acceptingResponses = true if not present
UPDATE forms 
SET settings = settings || '{"acceptingResponses": true}'::jsonb
WHERE NOT (settings ? 'acceptingResponses');

-- Add a comment about the setting
COMMENT ON COLUMN forms.settings IS 'Form settings including limitToOneResponse, confirmationMessage, acceptingResponses, etc.';
