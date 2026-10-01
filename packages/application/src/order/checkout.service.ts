import type { CreateCheckoutDto } from '@jeanius/contracts';
import type { IOrderRepository } from './order-repository.port';

export class CheckoutService {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async initiateCheckout(_checkout: CreateCheckoutDto): Promise<{ checkoutId: string }> {
    void this.orderRepo;
    return { checkoutId: `chk_${Date.now()}` };
  }
}
