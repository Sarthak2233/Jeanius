import type { SignUpDto } from '@jeanius/contracts';
import { UserRegisteredEvent, createEntityId } from '@jeanius/domain';
import type { IAuthGateway } from './auth-gateway.port';
import type { IUserProfileRepository } from './user-profile-repository.port';
import type { IOutboxRepository } from '../audit/outbox-repository.port';

export interface SignUpResult {
  readonly userId: string;
  readonly email: string;
  readonly emailConfirmationRequired: boolean;
}

export class SignUpUseCase {
  constructor(
    private readonly authGateway: IAuthGateway,
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly outboxRepository?: IOutboxRepository,
  ) {}

  async execute(dto: SignUpDto): Promise<SignUpResult> {
    const { userId, emailConfirmationRequired } = await this.authGateway.signUp({
      email: dto.email,
      password: dto.password,
      fullName: dto.fullName,
    });

    // Create synchronized profile in database
    await this.userProfileRepository.create({
      id: createEntityId<'UserProfile'>(userId),
      email: dto.email,
      fullName: dto.fullName,
      role: 'CUSTOMER',
      phone: dto.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Stage transactional outbox event if outbox repo available
    if (this.outboxRepository) {
      await this.outboxRepository.append([
        new UserRegisteredEvent(userId, {
          email: dto.email,
          fullName: dto.fullName,
          role: 'CUSTOMER',
        }),
      ]);
    }

    return {
      userId,
      email: dto.email,
      emailConfirmationRequired,
    };
  }
}
