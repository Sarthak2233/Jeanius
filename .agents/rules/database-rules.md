---
trigger: always_on
---

# Database Access & Persistence Rules (JN-051)

This rule defines the database access patterns, repository port implementations, and transaction standards for the Jeanius platform.

---

## 1. Repository Pattern Isolation

- **Single Home:** All Drizzle ORM schemas, SQL queries, and database client connections reside strictly in `packages/database`.
- **Port Implementation:** Every database repository class (e.g. `DrizzleOrderRepository`) must implement an abstract repository port interface defined in `packages/application` (e.g. `IOrderRepository`).
- **No Leaky Abstractions:** Repository methods must return domain entities (`Order`, `Product`, `FabricBolt`), **never** raw Drizzle SQL row records.

---

## 2. Transaction & Consistency Standards

- **Atomic State Mutations:** Multi-table mutations (e.g. updating an order, decrementing bolt yardage, and publishing events) must execute within an explicit database transaction:
  ```typescript
  await db.transaction(async (tx) => {
    await orderRepo.save(tx, order);
    await inventoryRepo.reserve(tx, reservation);
  });
  ```
- **Connection Pooling:**
  - Serverless queries in Next.js Server Actions and Route Handlers must connect through Supabase Supavisor connection pooler (port `6543`, transaction mode).
  - Session-mode direct connection (port `5432`) is strictly reserved for database migration runs.

---

## 3. Mandatory Transactional Outbox Pattern

- **Zero Dual-Writes:** Never call external third-party APIs (Stripe, SendGrid, DHL) directly inside a database mutation without the outbox.
- Every domain event generated during a state change must be written to the `outbox_events` table within the same ACID transaction as the entity update.
- Downstream asynchronous processors poll or stream `outbox_events` to deliver side effects reliably.