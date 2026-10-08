import type { RequestPasswordResetDto, ResetPasswordDto } from '@jeanius/contracts';
import { PasswordResetRequestedEvent } from '@jeanius/domain';
import { createLogger } from '@jeanius/observability';
import type { IAuthGateway } from './auth-gateway.port';
import type { IOutboxRepository } from '../audit/outbox-repository.port';

const logger = createLogger('application:auth:password-reset');

export class RequestPasswordResetUseCase {
  constructor(
    private readonly authGateway: IAuthGateway,
    private readonly outboxRepository?: IOutboxRepository,
  ) {}

  async execute(dto: RequestPasswordResetDto, redirectTo?: string): Promise<void> {
    logger.info('Password reset initiated', { email: dto.email });
    await this.authGateway.requestPasswordReset(dto.email, redirectTo);

    if (this.outboxRepository) {
      await this.outboxRepository.append([
        new PasswordResetRequestedEvent(dto.email, {
          email: dto.email,
        }),
      ]);
    }

    logger.info('Password reset event staged', {
      email: dto.email,
      hasOutboxEvent: Boolean(this.outboxRepository),
    });
  }
}

export class ResetPasswordUseCase {
  constructor(private readonly authGateway: IAuthGateway) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    await this.authGateway.updatePassword(dto.password);
    logger.info('Password updated successfully');
  }
}
