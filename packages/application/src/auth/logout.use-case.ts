import type { IAuthGateway } from './auth-gateway.port';

export class LogoutUseCase {
  constructor(private readonly authGateway: IAuthGateway) {}

  async execute(): Promise<void> {
    await this.authGateway.signOut();
  }
}
