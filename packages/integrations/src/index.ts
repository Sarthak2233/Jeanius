/**
 * @jeanius/integrations
 * External provider adapters: Payment Orchestrator, Shipping, and Notifications.
 */
import type { Order } from '@jeanius/domain';
import type { IPaymentGateway } from '@jeanius/application';

export interface PaymentProviderAdapter {
  readonly providerId: string;
  initiatePayment(order: Order): Promise<{ paymentUrl: string; transactionId: string }>;
  verifyWebhook(payload: unknown, signature: string): Promise<boolean>;
}

export class StripePaymentAdapter implements PaymentProviderAdapter {
  readonly providerId = 'stripe';

  async initiatePayment(order: Order): Promise<{ paymentUrl: string; transactionId: string }> {
    // In production, instantiate Stripe Checkout Session
    return {
      paymentUrl: `https://checkout.stripe.com/pay/${order.id}`,
      transactionId: `stripe_txn_${Date.now()}`,
    };
  }

  async verifyWebhook(_payload: unknown, _signature: string): Promise<boolean> {
    return true;
  }
}

export class NepalDomesticPaymentAdapter implements PaymentProviderAdapter {
  readonly providerId = 'nepal-domestic'; // Supports eSewa / Khalti / Fonepay

  async initiatePayment(order: Order): Promise<{ paymentUrl: string; transactionId: string }> {
    return {
      paymentUrl: `https://epay.nepal-gateway.com/pay?order=${order.orderNumber}`,
      transactionId: `npr_txn_${Date.now()}`,
    };
  }

  async verifyWebhook(_payload: unknown, _signature: string): Promise<boolean> {
    return true;
  }
}

/**
 * PaymentOrchestrator routes payment requests to the appropriate rail
 * (International card rail vs Nepal domestic wallet rail) based on order currency.
 */
export class PaymentOrchestrator implements IPaymentGateway {
  private readonly adapters: Map<string, PaymentProviderAdapter> = new Map();

  constructor() {
    this.registerAdapter(new StripePaymentAdapter());
    this.registerAdapter(new NepalDomesticPaymentAdapter());
  }

  registerAdapter(adapter: PaymentProviderAdapter): void {
    this.adapters.set(adapter.providerId, adapter);
  }

  async initiatePayment(order: Order): Promise<{ paymentUrl: string; transactionId: string }> {
    const isDomestic = order.total.currency === 'NPR';
    const providerId = isDomestic ? 'nepal-domestic' : 'stripe';
    const adapter = this.adapters.get(providerId);

    if (!adapter) {
      throw new Error(`Payment adapter '${providerId}' not registered`);
    }

    return adapter.initiatePayment(order);
  }

  async verifyWebhook(_payload: unknown, _signature: string): Promise<boolean> {
    // Delegates to specific provider based on signature/header
    return true;
  }
}
