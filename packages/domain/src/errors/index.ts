/**
 * @jeanius/domain Standardized Error Hierarchy
 *
 * Defines typed error primitives across the Jeanius platform.
 * Bounded contexts throw specific domain errors to guarantee type safety
 * and unambiguous failure handling in application use cases and UI transports.
 */

export abstract class BaseError extends Error {
  public abstract readonly code: string;
  public readonly timestamp: string;

  constructor(
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      details: this.details,
    };
  }
}

// ================= 1. Domain Errors (Business Invariants) =================

export class DomainError extends BaseError {
  public override readonly code: string = 'DOMAIN_ERROR';
}

export class InvalidMeasurementError extends DomainError {
  public readonly code = 'INVALID_MEASUREMENT';
  constructor(field: string, value: number, min: number, max: number) {
    super(`Invalid ${field}: ${value}. Permitted range is ${min}" to ${max}".`, {
      field,
      value,
      min,
      max,
    });
  }
}

export class InvalidStateTransitionError extends DomainError {
  public readonly code = 'INVALID_STATE_TRANSITION';
  constructor(entity: string, fromState: string, toState: string) {
    super(`Cannot transition ${entity} from state "${fromState}" to "${toState}".`, {
      entity,
      fromState,
      toState,
    });
  }
}

export class FabricBoltExhaustedError extends DomainError {
  public readonly code = 'FABRIC_BOLT_EXHAUSTED';
  constructor(boltId: string, requestedMeters: number, availableMeters: number) {
    super(
      `Insufficient continuous yardage on fabric bolt ${boltId}. Requested: ${requestedMeters}m, Available: ${availableMeters}m.`,
      { boltId, requestedMeters, availableMeters },
    );
  }
}

export class InventoryHoldExpiredError extends DomainError {
  public readonly code = 'INVENTORY_HOLD_EXPIRED';
  constructor(reservationId: string) {
    super(`Inventory reservation ${reservationId} has expired. Please re-enter checkout.`, {
      reservationId,
    });
  }
}

export class DropSoldOutError extends DomainError {
  public readonly code = 'DROP_SOLD_OUT';
  constructor(variantId: string) {
    super(`Selected garment variant ${variantId} is completely sold out.`, { variantId });
  }
}

export class OrderCannotBeCancelledError extends DomainError {
  public readonly code = 'ORDER_CANNOT_BE_CANCELLED';
  constructor(orderId: string, currentStage: string) {
    super(
      `Order ${orderId} cannot be cancelled because garment has already entered "${currentStage}".`,
      { orderId, currentStage },
    );
  }
}

export class ReturnEligibilityExpiredError extends DomainError {
  public readonly code = 'RETURN_ELIGIBILITY_EXPIRED';
  constructor(orderId: string, deliveredAt: string) {
    super(
      `Order ${orderId} is ineligible for return. 5-day inspection window expired (delivered on ${deliveredAt}).`,
      { orderId, deliveredAt },
    );
  }
}

// ================= 2. Application Errors (Use-Case Execution) =================

export class ApplicationError extends BaseError {
  public override readonly code: string = 'APPLICATION_ERROR';
}

export class NotFoundError extends ApplicationError {
  public override readonly code = 'NOT_FOUND';
  constructor(resource: string, identifier: string) {
    super(`${resource} with identifier "${identifier}" was not found.`, { resource, identifier });
  }
}

export class ConflictError extends ApplicationError {
  public override readonly code = 'CONFLICT';
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}

export class UnauthorizedError extends ApplicationError {
  public override readonly code = 'UNAUTHORIZED';
  constructor(message = 'Authentication required to perform this action.') {
    super(message);
  }
}

export class ForbiddenError extends ApplicationError {
  public override readonly code = 'FORBIDDEN';
  constructor(role: string, operation: string) {
    super(`Actor with role "${role}" is not authorized to execute "${operation}".`, {
      role,
      operation,
    });
  }
}

// ================= 3. Infrastructure Errors (External Providers) =================

export class InfrastructureError extends BaseError {
  public override readonly code: string = 'INFRASTRUCTURE_ERROR';
}

export class PaymentGatewayError extends InfrastructureError {
  public override readonly code = 'PAYMENT_GATEWAY_ERROR';
  constructor(provider: string, message: string, details?: Record<string, unknown>) {
    super(`Payment gateway [${provider}] failure: ${message}`, { provider, ...details });
  }
}

export class CourierApiError extends InfrastructureError {
  public override readonly code = 'COURIER_API_ERROR';
  constructor(carrier: string, message: string, details?: Record<string, unknown>) {
    super(`Courier service [${carrier}] error: ${message}`, { carrier, ...details });
  }
}

export class AuthServiceError extends InfrastructureError {
  public override readonly code = 'AUTH_SERVICE_ERROR';
  constructor(service: string, message: string, details?: Record<string, unknown>) {
    super(`Authentication service [${service}] error: ${message}`, { service, ...details });
  }
}
