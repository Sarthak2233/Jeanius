import type { AddToCartDto } from '@jeanius/contracts';
import { createLogger } from '@jeanius/observability';
import type { ICartRepository } from './cart-repository.port';

export class CartService {
  private readonly logger = createLogger('cart-service');

  constructor(private readonly cartRepo: ICartRepository) {}

  async addItem(cartId: string, item: AddToCartDto): Promise<void> {
    const cart = await this.cartRepo.findById(cartId);
    if (!cart) {
      this.logger.warn('Cart not found for addItem', { cartId });
      throw new Error(`Cart ${cartId} not found`);
    }

    this.logger.info('Item added to cart', {
      cartId,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    });
  }
}
