# Database Migration & Schema Rules (JN-057)

This rule defines the database schema lifecycle, migration generation, and deployment standards for Supabase PostgreSQL and Drizzle ORM.

---

## 1. Migration Fundamentals

- **Declarative Source:** The single source of truth for the database schema is the TypeScript files in `packages/database/src/schema/`.
- **Drizzle Kit Generation:** All migrations must be generated as version-controlled SQL files via:
  ```bash
  pnpm --filter @jeanius/database db:generate
  ```
- **Commit Requirement:** Every generated SQL file in `packages/database/drizzle/` must be reviewed and committed to git alongside the schema change.

---

## 2. Zero-Downtime & Forward Compatibility Rules

In a continuous deployment environment, old and new application code may run concurrently during a rollout.

- **The "Expand and Contract" Pattern:**
  - **Never rename or drop columns** in a single migration if running application instances depend on them.
  - *Phase 1 (Expand):* Add new column as nullable, backfill data, and update application code to write to both columns.
  - *Phase 2 (Contract):* In a subsequent deployment, switch reads to the new column, and safely drop the old column.
- **Never Modify Existing Migrations:** Once a migration has been applied or merged to `main`, its SQL file is immutable. Never edit historical migrations; generate a new migration to make corrections.

---

## 3. Database Constraints Standards

- **Enums & Check Constraints:** All database columns storing domain statuses or measurements must use PostgreSQL ENUMs or CHECK constraints matching domain rules:
  - Inseam check: `CHECK (inseam_length >= 26.0 AND inseam_length <= 36.0)`
  - Waist check: `CHECK (waist_size >= 28.0 AND waist_size <= 42.0)`
- **Indices:** Foreign key columns and search columns (`customer_id`, `order_id`, `status`, `created_at`) must always have explicit indices.
