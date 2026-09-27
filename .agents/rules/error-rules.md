# Error Handling & Hierarchy Rules (JN-053)

This rule defines the standardized error hierarchy, throwing conventions, and error serialization across all layers of the Jeanius monorepo.

---

## 1. The Three Error Layers

Every error in the platform inherits from `BaseError` in `packages/domain/src/errors/`:

```
               ┌───────────────┐
               │   BaseError   │
               └───────┬───────┘
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌────────────────────┐
│ DomainError │ │Application- │ │InfrastructureError │
│             │ │Error        │ │                    │
└─────────────┘ └─────────────┘ └────────────────────┘
```

1. **`DomainError`:** Thrown when a pure business invariant is violated.
   - Examples: `InvalidMeasurementError`, `InvalidStateTransitionError`, `FabricBoltExhaustedError`, `DropSoldOutError`, `OrderCannotBeCancelledError`.
2. **`ApplicationError`:** Thrown when use-case orchestration encounters an operational block.
   - Examples: `NotFoundError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`.
3. **`InfrastructureError`:** Thrown when an external gateway or adapter fails.
   - Examples: `PaymentGatewayError`, `CourierApiError`.

---

## 2. Throwing vs. Returning Conventions

- **Inside Domain & Application Layers:** Throw specific, typed error classes. Never throw generic JavaScript `new Error('...')` or raw strings.
- **At UI / Server Action Boundaries:** Catch errors and map them to a standardized serializable response:
  ```typescript
  type ActionResult<T> = 
    | { success: true; data: T }
    | { success: false; error: { code: string; message: string; details?: Record<string, unknown> } };
  ```
- **At Route Handler Boundaries (Webhooks/REST):** Map domain/application errors to appropriate HTTP status codes:
  - `InvalidMeasurementError` / `DomainError` → `422 Unprocessable Entity`
  - `NotFoundError` → `404 Not Found`
  - `UnauthorizedError` → `401 Unauthorized`
  - `ForbiddenError` → `403 Forbidden`
  - `ConflictError` → `409 Conflict`
  - `InfrastructureError` → `502 Bad Gateway`
