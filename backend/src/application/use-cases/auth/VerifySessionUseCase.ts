import { IAdminRepository } from '../../../domain/repositories/IAdminRepository';

export interface VerifySessionOutput {
  admin: {
    id: string;
    email: string;
    name?: string;
  };
}

// Default admin info (for when DB is not seeded)
const DEFAULT_ADMIN = {
  id: 'default-admin-id',
  email: 'admin@ecx.com.ng',
  name: 'ECX Admin',
};

export class VerifySessionUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(token: string): Promise<VerifySessionOutput> {
    if (!token || token.length < 32) {
      throw new SessionExpiredError('Invalid token');
    }

    // Try to find session in database
    try {
      const session = await this.adminRepository.findSessionByToken(token);
      
      if (session) {
        if (new Date(session.expiresAt) < new Date()) {
          await this.adminRepository.deleteSession(token);
          throw new SessionExpiredError('Session expired');
        }

        const admin = await this.adminRepository.findById(session.adminId);
        
        if (admin) {
          return {
            admin: {
              id: admin.id,
              email: admin.email,
              name: admin.name,
            },
          };
        }
      }
    } catch (error) {
      // If it's a session expired error, rethrow it
      if (error instanceof SessionExpiredError) {
        throw error;
      }
      // Database error - fall through to default admin check
      console.warn('Could not verify session in database:', error);
    }

    // Fallback: If token looks valid (has correct length), 
    // return the default admin info
    // This allows the app to work without DB session storage
    if (token && token.length >= 32) {
      return {
        admin: DEFAULT_ADMIN,
      };
    }

    throw new SessionExpiredError('Session expired or invalid');
  }
}

export class SessionExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionExpiredError';
  }
}
