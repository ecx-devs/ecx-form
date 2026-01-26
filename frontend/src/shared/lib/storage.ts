import { STORAGE_KEYS } from '../config/constants';
import { v4 as uuidv4 } from 'uuid';

// Get or create user identifier for "Fill Once" feature
export function getUserIdentifier(): string {
  if (typeof window === 'undefined') return '';

  let identifier = localStorage.getItem(STORAGE_KEYS.userIdentifier);
  if (!identifier) {
    identifier = uuidv4();
    localStorage.setItem(STORAGE_KEYS.userIdentifier, identifier);
  }
  return identifier;
}

// Form draft management
export function saveFormDraft<T>(formId: string, data: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      STORAGE_KEYS.formDraft(formId),
      JSON.stringify({ data, savedAt: new Date().toISOString() })
    );
  } catch (error) {
    console.error('Failed to save form draft:', error);
  }
}

export function getFormDraft<T>(formId: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.formDraft(formId));
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return parsed.data as T;
  } catch (error) {
    console.error('Failed to load form draft:', error);
    return null;
  }
}

export function clearFormDraft(formId: string): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEYS.formDraft(formId));
}

// Submission tracking
export function markFormAsSubmitted(formId: string): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(
    STORAGE_KEYS.submissionKey(formId),
    new Date().toISOString()
  );

  // Also set a cookie for additional tracking
  document.cookie = `ecx_submitted_${formId}=true; max-age=${60 * 60 * 24 * 365}; path=/`;
}

export function hasSubmittedForm(formId: string): boolean {
  if (typeof window === 'undefined') return false;

  // Check localStorage
  const stored = localStorage.getItem(STORAGE_KEYS.submissionKey(formId));
  if (stored) return true;

  // Check cookie
  return document.cookie.includes(`ecx_submitted_${formId}=true`);
}

