import type { LoginDto } from '@jeanius/contracts';
import type { ActorRole } from '@jeanius/domain';
import type { IAuthGateway, AuthUserSession } from './auth-gateway.port';
import type { IUserProfileRepository } from './user-profile-repository.port';

export interface LoginResult {
  readonly session: AuthUserSession;
  readonly role: ActorRole;
  readonly fullName: string;
}

export class LoginUseCase {
  constructor(
    private readonly authGateway: IAuthGateway,
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const session = await this.authGateway.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    const profile = await this.userProfileRepository.findById(session.userId);

    // Profile role takes canonical precedence for RBAC
    const role: ActorRole = profile?.role ?? session.role ?? 'CUSTOMER';
    const fullName = profile?.fullName ?? 'Valued Customer';

    return {
      session: {
        ...session,
        role,
      },
      role,
      fullName,
    };
  }
}
