import { SupabaseClient } from '@supabase/supabase-js';
import { Admin, AdminProps, AdminSession } from '../../domain/entities/Admin';
import { IAdminRepository } from '../../domain/repositories/IAdminRepository';

interface AdminRow {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

interface SessionRow {
  id: string;
  admin_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export class SupabaseAdminRepository implements IAdminRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findByEmail(email: string): Promise<Admin | null> {
    const { data, error } = await this.supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findById(id: string): Promise<Admin | null> {
    const { data, error } = await this.supabase
      .from('admins')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return this.toDomain(data);
  }

  async verifyPassword(email: string, password: string): Promise<Admin | null> {
    // Use Supabase RPC to verify password with pgcrypto
    const { data, error } = await this.supabase.rpc('verify_admin_password', {
      p_email: email.toLowerCase(),
      p_password: password,
    });

    if (error || !data || data.length === 0) {
      // Fallback: try direct query with crypt comparison
      const { data: adminData, error: adminError } = await this.supabase
        .from('admins')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (adminError || !adminData) {
        return null;
      }

      // For now, we'll use a simple comparison (in production, use proper bcrypt)
      // This requires the RPC function to be created
      return null;
    }

    return this.toDomain(data[0]);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.supabase
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', id);
  }

  async createSession(adminId: string, token: string, expiresAt: Date): Promise<AdminSession> {
    const { data, error } = await this.supabase
      .from('admin_sessions')
      .insert({
        admin_id: adminId,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return this.toSessionDomain(data);
  }

  async findSessionByToken(token: string): Promise<AdminSession | null> {
    const { data, error } = await this.supabase
      .from('admin_sessions')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    return this.toSessionDomain(data);
  }

  async deleteSession(token: string): Promise<void> {
    await this.supabase
      .from('admin_sessions')
      .delete()
      .eq('token', token);
  }

  async deleteExpiredSessions(): Promise<void> {
    await this.supabase
      .from('admin_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());
  }

  private toDomain(row: AdminRow): Admin {
    const props: AdminProps = {
      id: row.id,
      email: row.email,
      name: row.name || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
    };
    return new Admin(props);
  }

  private toSessionDomain(row: SessionRow): AdminSession {
    return {
      id: row.id,
      adminId: row.admin_id,
      token: row.token,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
    };
  }
}

