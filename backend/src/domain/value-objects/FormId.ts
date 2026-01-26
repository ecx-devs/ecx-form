/**
 * FormId Value Object
 * Format: ECXF + 4 Random Letters (uppercase)
 * Example: ECXFABCD
 */
export class FormId {
  private readonly _value: string;
  private static readonly PREFIX = 'ECXF';
  private static readonly PATTERN = /^ECXF[A-Z]{4}$/;

  private constructor(value: string) {
    if (!FormId.isValid(value)) {
      throw new Error(`Invalid Form ID format: ${value}. Expected format: ECXF + 4 uppercase letters`);
    }
    this._value = value;
  }

  static generate(): FormId {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return new FormId(`${this.PREFIX}${randomPart}`);
  }

  static fromString(value: string): FormId {
    return new FormId(value.toUpperCase());
  }

  static isValid(value: string): boolean {
    return this.PATTERN.test(value);
  }

  get value(): string {
    return this._value;
  }

  equals(other: FormId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
