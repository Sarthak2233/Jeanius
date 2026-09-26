import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:54322/postgres';

// For serverless runtimes, use max 1 connection per instance
export const queryClient = postgres(connectionString, { max: 1 });
export const db = drizzle(queryClient, { schema });

export type Database = typeof db;
