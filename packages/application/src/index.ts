/**
 * @jeanius/application
 * Use cases, application services, and ports (repository/gateway interfaces).
 */
import type {
  Product,
  Cart,
  Order,
  ProductionJob,
  ProductionStage,
} from '@jeanius/domain';
import type { AddToCartDto, CreateCheckoutDto } from '@jeanius/contracts';

// ================= Ports (Repository & Gateway Interfaces) =================

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  listPublished(): Promise<readonly Product[]>;
}

export interface ICartRepository {
  findById(id: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}

export interface IProductionJobRepository {
  findById(id: string): Promise<ProductionJob | null>;
  findByStage(stage: ProductionStage): Promise<readonly ProductionJob[]>;
  save(job: ProductionJob): Promise<void>;
}

export interface IPaymentGateway {
  initiatePayment(order: Order): Promise<{ paymentUrl: string; transactionId: string }>;
  verifyWebhook(payload: unknown, signature: string): Promise<boolean>;
}

// ================= Application Services =================

export class CatalogService {
  constructor(private readonly productRepo: IProductRepository) {}

  async getProductBySlug(slug: string): Promise<Product | null> {
    return this.productRepo.findBySlug(slug);
  }

  async listPublishedProducts(): Promise<readonly Product[]> {
    return this.productRepo.listPublished();
  }
}

export class CartService {
  constructor(private readonly cartRepo: ICartRepository) {}

  async addItem(cartId: string, _item: AddToCartDto): Promise<void> {
    const cart = await this.cartRepo.findById(cartId);
    if (!cart) {
      throw new Error(`Cart ${cartId} not found`);
    }
  }
}

export class CheckoutService {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async initiateCheckout(_checkout: CreateCheckoutDto): Promise<{ checkoutId: string }> {
    void this.orderRepo;
    return { checkoutId: `chk_${Date.now()}` };
  }
}

export class ProductionService {
  constructor(private readonly productionRepo: IProductionJobRepository) {}

  async transitionStage(jobId: string, nextStage: ProductionStage, notes?: string): Promise<ProductionJob> {
    const job = await this.productionRepo.findById(jobId);
    if (!job) {
      throw new Error(`ProductionJob ${jobId} not found`);
    }

    const updatedJob: ProductionJob = {
      ...job,
      currentStage: nextStage,
      notes: notes ? [...(job.notes || []), notes] : job.notes,
      updatedAt: new Date().toISOString(),
    };

    await this.productionRepo.save(updatedJob);
    return updatedJob;
  }
}
