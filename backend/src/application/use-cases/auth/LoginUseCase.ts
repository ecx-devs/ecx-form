import crypto from 'crypto';
import { IAdminRepository } from '../../../domain/repositories/IAdminRepository';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  token: string;
  admin: {
    id: string;
    email: string;
    name?: string;
  };
  expiresAt: string;
}

// Default admin credentials (for when DB is not seeded)
const DEFAULT_ADMIN = {
  email: 'admin@ecx.com.ng',
  password: 'ecx@2026!',
  name: 'ECX Admin',
};

export class LoginUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const { email, password } = input;
    const normalizedEmail = email.toLowerCase().trim();

    // First, try to find admin in database
    let admin = await this.adminRepository.findByEmail(normalizedEmail);
    
    // If admin found in DB, verify password against DB
    // For now, we use hardcoded verification since we don't have bcrypt in DB
    if (admin) {
      const isValidPassword = this.verifyHardcodedPassword(normalizedEmail, password);
      if (!isValidPassword) {
        throw new InvalidCredentialsError('Invalid email or password');
      }
    } else {
      // Fallback: check against default admin credentials
      const isValidPassword = this.verifyHardcodedPassword(normalizedEmail, password);
      if (!isValidPassword) {
        throw new InvalidCredentialsError('Invalid email or password');
      }
      
      // Create a mock admin object for session
      admin = {
        id: 'default-admin-id',
        email: DEFAULT_ADMIN.email,
        name: DEFAULT_ADMIN.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: undefined,
        updateLastLogin: () => {},
        toJSON: () => ({
          id: 'default-admin-id',
          email: DEFAULT_ADMIN.email,
          name: DEFAULT_ADMIN.name,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: undefined,
        }),
      } as any;
    }

    // At this point admin should be set
    const adminId = admin?.id || 'default-admin-id';
    const adminEmail = admin?.email || DEFAULT_ADMIN.email;
    const adminName = admin?.name || DEFAULT_ADMIN.name;

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Try to create session in DB (may fail if tables don't exist)
    try {
      await this.adminRepository.createSession(adminId, token, expiresAt);
      await this.adminRepository.updateLastLogin(adminId);
    } catch (error) {
      // Session storage failed, but we'll still return a valid token
      // The frontend will store the token locally
      console.warn('Could not store session in database:', error);
    }

    return {
      token,
      admin: {
        id: adminId,
        email: adminEmail,
        name: adminName,
      },
      expiresAt: expiresAt.toISOString(),
    };
  }

  private verifyHardcodedPassword(email: string, password: string): boolean {
    // Simple check for the seeded admin
    // In production, this would verify against the hashed password in DB
    return email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password;
  }
}

export class InvalidCredentialsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}
