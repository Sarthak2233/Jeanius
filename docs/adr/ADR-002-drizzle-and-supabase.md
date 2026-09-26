# ADR-002: Supabase PostgreSQL + Drizzle ORM

## Status
Accepted

## Context
The platform requires a robust relational database with Row Level Security (RLS) for multi-tenant customer and admin data, along with performant serverless execution.

## Decision
We select Supabase PostgreSQL as the primary data store and Drizzle ORM as the TypeScript database layer in `packages/database`.
- Drizzle provides zero-overhead query compilation, full SQL control, and near-zero cold starts in serverless environments compared to heavier ORMs like Prisma.
- Schema migrations are managed via version-controlled SQL files with `drizzle-kit`.
- Application queries access the database strictly through repository ports, preventing leakage of database details into domain logic.
