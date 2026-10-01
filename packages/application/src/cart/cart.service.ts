import type { AddToCartDto } from '@jeanius/contracts';
import type { ICartRepository } from './cart-repository.port';

export class CartService {
  constructor(private readonly cartRepo: ICartRepository) {}

  async addItem(cartId: string, _item: AddToCartDto): Promise<void> {
    const cart = await this.cartRepo.findById(cartId);
    if (!cart) {
      throw new Error(`Cart ${cartId} not found`);
    }
  }
}
