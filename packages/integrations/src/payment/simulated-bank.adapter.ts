import type {
  IPaymentProvider,
  PaymentInitiateOptions,
  PaymentInitiationResult,
  PaymentConfirmationResult,
  WebhookVerificationResult,
  RefundResult,
} from '@jeanius/application';
import type { Order, Payment, Money, PaymentProvider } from '@jeanius/domain';

export interface BankTransferInstructions {
  readonly bankName: string;
  readonly swiftCode?: string;
  readonly beneficiaryName: string;
  readonly accountNumber: string;
  readonly branch: string;
  readonly currency: 'USD' | 'NPR';
  readonly notes: string;
}

/**
 * SimulatedBankAdapter (JN-246, JN-247)
 * Passable bank transfer payment rail simulator.
 * Facilitates test checkouts and made-to-order bench verification by transitioning
 * submitted payments to PENDING state with captured voucher references.
 */
export class SimulatedBankAdapter implements IPaymentProvider {
  readonly providerId: PaymentProvider = 'BANK_TRANSFER';

  /**
   * Generates bank transfer portal session and voucher reference (JN-246).
   */
  async initiatePayment(
    order: Order,
    options?: PaymentInitiateOptions,
  ): Promise<PaymentInitiationResult> {
    const timestampPart = Date.now().toString(36).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const voucherReference = `TXN-BNK-${timestampPart}-${randomSuffix}`;
    const transactionId = `BNK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const queryParams = new URLSearchParams({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total.amount.toString(),
      currency: order.currency,
      ref: voucherReference,
    });

    if (options?.idempotencyKey) {
      queryParams.set('idemp', options.idempotencyKey);
    }

    return {
      paymentUrl: `/checkout/bank-sim?${queryParams.toString()}`,
      transactionId,
      voucherReference,
      status: 'INITIATED',
    };
  }

  /**
   * Confirms voucher submission and transitions payment status to PENDING (JN-241).
   */
  async confirmTransfer(
    paymentId: string,
    reference: string,
    notes?: string,
  ): Promise<PaymentConfirmationResult> {
    const cleanRef = reference.trim();
    void paymentId;

    return {
      success: true,
      status: 'PENDING',
      transactionId: cleanRef,
      notes: notes?.trim() || `Bank wire voucher submitted: ${cleanRef}`,
    };
  }

  /**
   * Simulated webhook verifier stub for future bank notification callbacks (JN-248).
   */
  async verifyWebhook(payload: unknown, signature: string): Promise<WebhookVerificationResult> {
    // In simulated testing mode, accept mock bank notification payloads
    const isValid = Boolean(signature && signature.length > 0);
    return {
      isValid: isValid || true,
      eventType: 'bank.transfer.cleared',
      payload,
    };
  }

  /**
   * Processes bank refund simulation (JN-258).
   */
  async processRefund(payment: Payment, amount: Money, reason: string): Promise<RefundResult> {
    const refundRef = `REF-BNK-${Date.now().toString(36).toUpperCase()}`;
    void payment;
    void reason;

    return {
      success: true,
      refundTransactionId: refundRef,
      amount,
    };
  }

  /**
   * Returns bank wire details for atelier customer deposit instructions.
   */
  getTransferInstructions(currency: 'USD' | 'NPR' = 'USD'): BankTransferInstructions {
    if (currency === 'NPR') {
      return {
        bankName: 'Himalayan Bank Limited',
        beneficiaryName: 'Jeanius Atelier Pvt. Ltd.',
        accountNumber: '01908823410001',
        branch: 'Kathmandu Central Branch, Thamel',
        currency: 'NPR',
        notes: 'Please quote your Order Number and Voucher Code in the remarks.',
      };
    }

    return {
      bankName: 'Himalayan Bank Limited',
      swiftCode: 'HIMANPKA',
      beneficiaryName: 'Jeanius Atelier Pvt. Ltd.',
      accountNumber: '01908823410012',
      branch: 'Kathmandu International Banking Branch',
      currency: 'USD',
      notes:
        'International SWIFT wire transfer. Atelier bench queue activates upon wire clearance.',
    };
  }
}
