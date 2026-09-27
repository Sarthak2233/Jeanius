# Observability & Event Tracking Rules (JN-059)

This rule defines structured logging, correlation IDs, exception tracking, and telemetry standards across the Jeanius monorepo.

---

## 1. Structured JSON Logging

- **No Raw String Logs:** In production runtimes, logs must be formatted as structured JSON with standardized metadata fields:
  ```json
  {
    "timestamp": "2026-09-27T15:45:00.000Z",
    "level": "info",
    "message": "Order paid successfully via Stripe",
    "context": {
      "traceId": "c8f9b1a0-...",
      "orderId": "ord_9182",
      "amount": 28000,
      "currency": "USD",
      "actorId": "usr_4812"
    }
  }
  ```
- **LogLevel Standards:**
  - `debug`: Detailed internal logic tracing (disabled in production).
  - `info`: Key operational milestones (Order placed, Garment stage advanced, Payment captured).
  - `warn`: Recoverable anomalies (Failed payment attempt, Expired reservation released).
  - `error`: Unrecoverable errors, exceptions, gateway timeouts (sent to Sentry).

---

## 2. Correlation & Trace IDs

- Every incoming HTTP request and Server Action must generate or forward an `x-trace-id` (UUID).
- The `traceId` must be propagated across:
  - Application logs
  - Transactional Outbox events
  - Outbound external HTTP requests (Stripe metadata, courier tracking)
  - Sentry error scopes

---

## 3. Critical Business Telemetry

Track and monitor these key domain metrics:
- **Drop Inventory Velocity:** Rate of stock claims during limited drops.
- **Workshop Stage Dwell Time:** Time spent in each manufacturing stage (`Cutting`, `Sewing`, `Washing`).
- **Payment Gateway Latency:** Response time of Stripe vs. eSewa transactions.
- **Outbox Queue Depth:** Count of `PENDING` outbox events; alarm if events remain unprocessed for > 60 seconds.
