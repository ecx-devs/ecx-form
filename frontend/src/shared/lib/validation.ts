import { VALIDATION_RULES, ValidationRule } from '../config/constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateField(
  value: string | string[] | null,
  required: boolean,
  rule: ValidationRule = 'none',
  customErrorMessage?: string
): ValidationResult {
  // Check required
  if (required) {
    if (value === null || value === undefined) {
      return { isValid: false, error: 'This field is required' };
    }
    if (typeof value === 'string' && value.trim() === '') {
      return { isValid: false, error: 'This field is required' };
    }
    if (Array.isArray(value) && value.length === 0) {
      return { isValid: false, error: 'Please select at least one option' };
    }
  }

  // If empty and not required, it's valid
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: true };
  }

  // Apply validation rule
  if (rule !== 'none' && typeof value === 'string') {
    const ruleConfig = VALIDATION_RULES[rule];
    if (ruleConfig.pattern && !ruleConfig.pattern.test(value)) {
      return {
        isValid: false,
        error: customErrorMessage || `Please enter a valid ${ruleConfig.label.toLowerCase()}`,
      };
    }
  }

  return { isValid: true };
}

export function validateEmail(email: string): boolean {
  return VALIDATION_RULES.email.pattern!.test(email);
}

export function validateNumber(value: string): boolean {
  return VALIDATION_RULES.number.pattern!.test(value);
}

export function validateUrl(url: string): boolean {
  return VALIDATION_RULES.url.pattern!.test(url);
}

export function validateFileSize(sizeInBytes: number, maxSizeMB: number): boolean {
  return sizeInBytes <= maxSizeMB * 1024 * 1024;
}

export function validateFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.some(allowed => {
    if (allowed.endsWith('/*')) {
      const prefix = allowed.slice(0, -1);
      return mimeType.startsWith(prefix);
    }
    return mimeType === allowed;
  });
}

