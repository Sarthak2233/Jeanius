import {
  Cart,
  CartLine,
  Money,
  type CartId,
  type CartLineId,
  type CustomerId,
  type ProductId,
  type VariantId,
  type Currency,
  type CommerceModel,
} from '@jeanius/domain';
import type { CartItemDto } from '@jeanius/contracts';
import { createLogger } from '@jeanius/observability';
import type { ICartRepository } from './cart-repository.port.js';

export class CartService {
  private readonly logger = createLogger('application:cart-service');

  constructor(private readonly cartRepo: ICartRepository) {}

  async getCartByCustomerId(customerId: string): Promise<Cart | null> {
    const startTime = Date.now();
    const cart = await this.cartRepo.findByCustomerId(customerId);
    this.logger.debug('Queried cart by customer ID', {
      customerId,
      found: !!cart,
      itemCount: cart?.lines.length ?? 0,
      durationMs: Date.now() - startTime,
    });
    return cart;
  }

  async getOrCreateCart(customerId: string, currency: Currency = 'USD'): Promise<Cart> {
    const existing = await this.cartRepo.findByCustomerId(customerId);
    if (existing) {
      return existing;
    }

    const newCart = new Cart({
      id: crypto.randomUUID() as CartId,
      customerId: customerId as CustomerId,
      currency,
      lines: [],
    });

    await this.cartRepo.save(newCart);
    this.logger.info('Created new customer cart', {
      cartId: newCart.id,
      customerId,
      currency,
    });
    return newCart;
  }

  async syncCart(customerId: string, guestItems: readonly CartItemDto[]): Promise<Cart> {
    const startTime = Date.now();
    const currency = (guestItems[0]?.unitPriceCurrency ?? 'USD') as Currency;
    const cart = await this.getOrCreateCart(customerId, currency);

    const domainLines = guestItems.map((item) => this.mapDtoToDomainLine(cart.id, item));
    cart.replaceLines(domainLines);

    await this.cartRepo.save(cart);

    this.logger.info('Synchronized customer cart', {
      cartId: cart.id,
      customerId,
      itemCount: cart.lines.length,
      durationMs: Date.now() - startTime,
    });
    return cart;
  }

  async mergeGuestCart(customerId: string, guestItems: readonly CartItemDto[]): Promise<Cart> {
    const startTime = Date.now();
    const currency = (guestItems[0]?.unitPriceCurrency ?? 'USD') as Currency;
    const cart = await this.getOrCreateCart(customerId, currency);

    const incomingDomainLines = guestItems.map((item) => this.mapDtoToDomainLine(cart.id, item));
    cart.mergeLines(incomingDomainLines);

    await this.cartRepo.save(cart);

    this.logger.info('Merged guest cart with member cart', {
      cartId: cart.id,
      customerId,
      mergedLineCount: cart.lines.length,
      durationMs: Date.now() - startTime,
    });
    return cart;
  }

  async clearCart(customerId: string): Promise<void> {
    const cart = await this.cartRepo.findByCustomerId(customerId);
    if (!cart) return;

    cart.clear();
    await this.cartRepo.save(cart);
    this.logger.info('Cleared customer cart', { customerId, cartId: cart.id });
  }

  private mapDtoToDomainLine(cartId: CartId, item: CartItemDto): CartLine {
    return new CartLine({
      id: (item.id || crypto.randomUUID()) as CartLineId,
      cartId,
      productId: item.productId as ProductId,
      variantId: item.variantId ? (item.variantId as VariantId) : undefined,
      productTitle: item.title,
      commerceModel: item.commerceModel as CommerceModel,
      unitPrice: new Money(item.unitPriceAmount, item.unitPriceCurrency as Currency),
      quantity: item.quantity,
      selectedOptions: item.selectedOptions ?? {},
      customSpecifications: item.customSpecifications,
    });
  }
}
