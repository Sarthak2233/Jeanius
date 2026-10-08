import type { CreateCheckoutDto } from '@jeanius/contracts';
import { createLogger } from '@jeanius/observability';
import type { IOrderRepository } from './order-repository.port';

export class CheckoutService {
  private readonly logger = createLogger('checkout-service');

  constructor(private readonly orderRepo: IOrderRepository) {}

  async initiateCheckout(checkout: CreateCheckoutDto): Promise<{ checkoutId: string }> {
    void this.orderRepo;
    const checkoutId = `chk_${Date.now()}`;
    this.logger.info('Checkout initiated', {
      checkoutId,
      cartId: checkout.cartId,
      customerEmail: checkout.customerEmail,
      country: checkout.shippingAddress.country,
    });
    return { checkoutId };
  }
}
