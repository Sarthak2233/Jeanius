import type { ActorRole } from '@jeanius/domain';

export interface AuthUserSession {
  readonly userId: string;
  readonly email: string;
  readonly role: ActorRole;
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresAt?: number;
}

export interface IAuthGateway {
  signUp(input: {
    readonly email: string;
    readonly password: string;
    readonly fullName: string;
  }): Promise<{ readonly userId: string; readonly emailConfirmationRequired: boolean }>;

  signInWithPassword(input: {
    readonly email: string;
    readonly password: string;
  }): Promise<AuthUserSession>;

  signOut(): Promise<void>;

  requestPasswordReset(email: string, redirectTo?: string): Promise<void>;

  updatePassword(newPassword: string): Promise<void>;

  getUserFromToken(
    token: string,
  ): Promise<{ readonly userId: string; readonly email: string } | null>;
}
