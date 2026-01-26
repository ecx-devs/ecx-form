/**
 * SubmissionId Value Object
 * Format: [FormId] + - + 4 Digit Sequence
 * Example: ECXFABCD-0001
 */
export class SubmissionId {
  private readonly _value: string;
  private static readonly PATTERN = /^ECXF[A-Z]{4}-\d{4}$/;

  private constructor(value: string) {
    if (!SubmissionId.isValid(value)) {
      throw new Error(`Invalid Submission ID format: ${value}. Expected format: ECXFXXXX-0000`);
    }
    this._value = value;
  }

  static generate(formId: string, sequenceNumber: number): SubmissionId {
    const paddedSequence = String(sequenceNumber + 1).padStart(4, '0');
    return new SubmissionId(`${formId}-${paddedSequence}`);
  }

  static fromString(value: string): SubmissionId {
    return new SubmissionId(value.toUpperCase());
  }

  static isValid(value: string): boolean {
    return this.PATTERN.test(value);
  }

  get value(): string {
    return this._value;
  }

  get formId(): string {
    return this._value.split('-')[0];
  }

  get sequenceNumber(): number {
    return parseInt(this._value.split('-')[1], 10);
  }

  equals(other: SubmissionId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

