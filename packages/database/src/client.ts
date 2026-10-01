import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

const connectionString =
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:54322/postgres';

const directConnectionString =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  'postgres://postgres:postgres@localhost:54322/postgres';

// For serverless runtimes, use max 1 connection per instance through Supavisor pooler
export const queryClient = postgres(connectionString, { max: 1 });
export const db = drizzle(queryClient, { schema });

// Direct session connection strictly for migration runs and administrative DDL
export function getDirectMigrationClient() {
  const directClient = postgres(directConnectionString, { max: 1 });
  return drizzle(directClient, { schema });
}

export type Database = typeof db;
export { schema };
