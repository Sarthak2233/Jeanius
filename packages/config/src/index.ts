/**
 * @jeanius/config
 * Typed environment validation and configuration defaults.
 */
import { z } from 'zod';

export const ServerEnvSchema = z.object({
  DATABASE_URL: z.string().url().default('postgres://postgres:postgres@localhost:54322/postgres'),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  ESEWA_MERCHANT_CODE: z.string().optional(),
  KHALTI_SECRET_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const ClientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export type ClientEnv = z.infer<typeof ClientEnvSchema>;

export function validateServerEnv(): ServerEnv {
  return ServerEnvSchema.parse(process.env);
}
