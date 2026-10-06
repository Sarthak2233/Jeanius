import type { RequestPasswordResetDto, ResetPasswordDto } from '@jeanius/contracts';
import { PasswordResetRequestedEvent } from '@jeanius/domain';
import type { IAuthGateway } from './auth-gateway.port';
import type { IOutboxRepository } from '../audit/outbox-repository.port';

export class RequestPasswordResetUseCase {
  constructor(
    private readonly authGateway: IAuthGateway,
    private readonly outboxRepository?: IOutboxRepository,
  ) {}

  async execute(dto: RequestPasswordResetDto, redirectTo?: string): Promise<void> {
    await this.authGateway.requestPasswordReset(dto.email, redirectTo);

    if (this.outboxRepository) {
      await this.outboxRepository.append([
        new PasswordResetRequestedEvent(dto.email, {
          email: dto.email,
        }),
      ]);
    }
  }
}

export class ResetPasswordUseCase {
  constructor(private readonly authGateway: IAuthGateway) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    await this.authGateway.updatePassword(dto.password);
  }
}
