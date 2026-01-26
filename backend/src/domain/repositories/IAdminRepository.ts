import { Admin, AdminSession } from '../entities/Admin';

export interface IAdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  findById(id: string): Promise<Admin | null>;
  verifyPassword(email: string, password: string): Promise<Admin | null>;
  updateLastLogin(id: string): Promise<void>;
  
  // Session management
  createSession(adminId: string, token: string, expiresAt: Date): Promise<AdminSession>;
  findSessionByToken(token: string): Promise<AdminSession | null>;
  deleteSession(token: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
}

