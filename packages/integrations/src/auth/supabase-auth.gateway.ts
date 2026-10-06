import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { IAuthGateway, AuthUserSession } from '@jeanius/application';
import { UnauthorizedError, AuthServiceError, type ActorRole } from '@jeanius/domain';

export class SupabaseAuthGateway implements IAuthGateway {
  private readonly client: SupabaseClient;
  private adminClient: SupabaseClient | null = null;

  constructor(customClient?: SupabaseClient) {
    if (customClient) {
      this.client = customClient;
    } else {
      const supabaseUrl =
        process.env.SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        'http://localhost:54321';
      const anonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhY2Nlc3NfdG9rZW4iOiJsb2NhbC1hbm9uLWtleSJ9';

      this.client = createClient(supabaseUrl, anonKey);
    }
  }

  async signUp(input: {
    readonly email: string;
    readonly password: string;
    readonly fullName: string;
  }): Promise<{ readonly userId: string; readonly emailConfirmationRequired: boolean }> {
    const { data, error } = await this.client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          role: 'CUSTOMER',
        },
      },
    });

    if (error) {
      throw new AuthServiceError('SupabaseAuth', error.message, { code: error.code });
    }

    if (!data.user) {
      throw new AuthServiceError('SupabaseAuth', 'Failed to provision user identity');
    }

    return {
      userId: data.user.id,
      emailConfirmationRequired: !data.session,
    };
  }

  async signInWithPassword(input: {
    readonly email: string;
    readonly password: string;
  }): Promise<AuthUserSession> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.user || !data.session) {
      throw new UnauthorizedError(error?.message || 'Invalid email or password.');
    }

    const role: ActorRole = (data.user.user_metadata?.role as ActorRole) || 'CUSTOMER';

    return {
      userId: data.user.id,
      email: data.user.email ?? input.email,
      role,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    };
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) {
      throw new AuthServiceError('SupabaseAuth', error.message);
    }
  }

  async requestPasswordReset(email: string, redirectTo?: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo:
        redirectTo ||
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (error) {
      throw new AuthServiceError('SupabaseAuth', error.message);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.client.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new AuthServiceError('SupabaseAuth', error.message);
    }
  }

  private getAdminClient(): SupabaseClient {
    if (this.adminClient) {
      return this.adminClient;
    }

    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      'eyJhY2Nlc3NfdG9rZW4iOiJsb2NhbC1zZXJ2aWNlLXJvbGUta2V5In0';

    this.adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    return this.adminClient;
  }

  async getUserFromToken(
    token: string,
  ): Promise<{ readonly userId: string; readonly email: string } | null> {
    const admin = this.getAdminClient();
    const { data, error } = await admin.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    return {
      userId: data.user.id,
      email: data.user.email ?? '',
    };
  }
}
