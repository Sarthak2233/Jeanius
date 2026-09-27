# ADR-006: Two-Phase Inventory Reservation & Drop Concurrency

## Status
Accepted

## Deciders
Jeanius Core Engineering Team

## Date
2026-09-27

---

## Context and Problem Statement
Jeanius releases exclusive ready-to-ship limited runs (DROP model) using rare Japanese selvedge denim fabric (e.g. only 30–50 pairs produced per lot). These capsule drops generate intense burst traffic at the moment of launch, with hundreds or thousands of prospective buyers arriving simultaneously.

Two major concurrency failure modes threaten the integrity of drops:
1. **Overselling / Race Conditions:** If inventory is only decremented after payment confirmation, dozens of buyers could be redirected to Stripe/eSewa simultaneously for the last remaining pair. Once they all pay, the system has oversold physical stock, necessitating humiliating manual apologies, chargebacks, and brand damage.
2. **Denial of Inventory / Cart Hoarding:** If inventory is permanently decremented the moment a customer clicks "Add to Cart" or "Proceed to Checkout", bots or indecisive users can hoard every unit in abandoned carts, locking real buyers out.

---

## Decision Drivers
- **Zero Overselling Guarantee:** It must be physically impossible for more orders to be placed than items in stock.
- **Fair Checkout Experience:** A customer who initiates payment must be guaranteed that their selected size is protected while they enter their card details.
- **Automated Expired Hold Recovery:** Abandoned or timed-out checkout attempts must instantly release held stock back into the available pool without manual admin intervention.
- **Serverless Database Efficiency:** Avoid heavy external distributed lock managers (like standalone Redis clusters) if PostgreSQL can deliver atomic row-level conditional locking natively.

---

## Considered Options
1. **Optimistic Concurrency Control (OCC) at Final Payment:** Check inventory version number during payment webhook. (Rejected: High rate of payment reversals and buyer frustration during 50-unit drops).
2. **Distributed Redis Mutex Lock:** Manage cart holds with Redis `SET key val NX EX 600`. (Rejected: Introduces another operational stateful infrastructure dependency alongside Supabase PostgreSQL).
3. **Database-Level Two-Phase Atomic Reservation (Claim + TTL):** Use PostgreSQL row-level atomic conditional updates (`UPDATE ... WHERE available - reserved >= qty RETURNING ...`) paired with short-lived reservation records and an automated expiration sweeper.

---

## Decision Outcome
Chosen option: **Option 3 — Database-Level Two-Phase Atomic Reservation (Claim + TTL)**.

### Implementation Architecture
1. **Phase 1: Soft Claim (Hold Reservation)**
   - When a user proceeds to checkout, a Next.js Server Action requests an inventory reservation.
   - An atomic SQL statement executes in `packages/database`:
     ```sql
     UPDATE variant_inventory
     SET reserved_quantity = reserved_quantity + :requestedQty,
         updated_at = NOW()
     WHERE variant_id = :variantId 
       AND (total_quantity - reserved_quantity) >= :requestedQty
     RETURNING id;
     ```
   - If successful, an `inventory_reservations` row is created with `expires_at = NOW() + INTERVAL '10 minutes'` and status `HELD`.
   - The user receives an active `reservationToken`. If the conditional check fails (stock exhausted), the user is immediately notified of `SOLD_OUT`.

2. **Phase 2: Hard Commit (Payment Verification)**
   - When the payment webhook verifies successful transaction:
     ```sql
     UPDATE variant_inventory
     SET total_quantity = total_quantity - :qty,
         reserved_quantity = reserved_quantity - :qty
     WHERE variant_id = :variantId;
     
     UPDATE inventory_reservations
     SET status = 'COMMITTED'
     WHERE id = :reservationId;
     ```

3. **Phase 3: Automatic Expiration Release**
   - If payment is not completed within 10 minutes, the reservation transitions to `EXPIRED`.
   - A scheduled cleanup worker (or trigger upon subsequent checkout reads) decrements `reserved_quantity` back to the available pool.

```
[Customer Checkout] ──(Request Hold)──► [Phase 1: Atomic Hold]
                                              │
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
             [Payment Verified in 10m]                 [Timeout > 10m / Abandon]
                         │                                         │
                         ▼                                         ▼
             [Phase 2: Hard Commit]                    [Phase 3: Release to Pool]
           (total - 1, reserved - 1)                      (reserved - 1)
```

---

## Consequences

### Positive
- **Guaranteed No Overselling:** Database row-level locks on the variant row ensure strict serializability on stock claims.
- **No Extra Infrastructure:** Leverages Supabase PostgreSQL transactions without spinning up external Redis servers.
- **Graceful High-Traffic Experience:** Shoppers who reach the payment step are protected; shoppers who miss out receive instant, honest out-of-stock feedback.

### Negative & Mitigations
- *Trade-off:* 10-minute holds temporarily reduce available inventory if shoppers abandon carts.
- *Mitigation:* The hold duration is strictly tuned to 10 minutes (sufficient for payment completion, short enough to return stock quickly).

---

## Architectural & Code Verification
- Domain Entity: `packages/domain/src/inventory/inventory-reservation.entity.ts`
- Database Repository: `packages/database/src/repositories/drizzle-inventory.repository.ts`
- Diagram: [Two-Phase Inventory Reservation Flow](file:///home/sarakb/projects/Jeanius/docs/assets/diagrams/two-phase-inventory-reservation.svg)
- Reference: [ADR-002 Supabase PostgreSQL + Drizzle ORM](file:///home/sarakb/projects/Jeanius/docs/adr/ADR-002-drizzle-and-supabase.md)
