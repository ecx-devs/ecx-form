export interface AdminProps {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export class Admin {
  private readonly _id: string;
  private readonly _email: string;
  private _name?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _lastLoginAt?: Date;

  constructor(props: AdminProps) {
    this._id = props.id;
    this._email = props.email;
    this._name = props.name;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._lastLoginAt = props.lastLoginAt;
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get name(): string | undefined {
    return this._name;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get lastLoginAt(): Date | undefined {
    return this._lastLoginAt;
  }

  updateLastLogin(): void {
    this._lastLoginAt = new Date();
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      lastLoginAt: this._lastLoginAt,
    };
  }
}

export interface AdminSession {
  id: string;
  adminId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

