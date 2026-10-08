import { createLogger } from '@jeanius/observability';
import type { IAuthGateway } from './auth-gateway.port';

const logger = createLogger('application:auth:logout');

export class LogoutUseCase {
  constructor(private readonly authGateway: IAuthGateway) {}

  async execute(): Promise<void> {
    await this.authGateway.signOut();
    logger.info('User session signed out');
  }
}
