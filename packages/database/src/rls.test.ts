import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('State 05: Row Level Security (RLS) Policy Specifications (JN-123, JN-124)', () => {
  const migrationPath = existsSync(
    resolve(process.cwd(), 'migrations/0002_enable_row_level_security.sql'),
  )
    ? resolve(process.cwd(), 'migrations/0002_enable_row_level_security.sql')
    : resolve(process.cwd(), 'packages/database/migrations/0002_enable_row_level_security.sql');

  it('migration 0002_enable_row_level_security.sql exists and is readable', () => {
    assert.ok(existsSync(migrationPath), 'Migration 0002 must exist');
    const sql = readFileSync(migrationPath, 'utf8');
    assert.ok(sql.length > 500, 'Migration must contain SQL statements');
  });

  it('enables ROW LEVEL SECURITY on all user-owned and operational tables', () => {
    const sql = readFileSync(migrationPath, 'utf8');
    const requiredTables = [
      'users_profile',
      'addresses',
      'orders',
      'order_lines',
      'carts',
      'cart_lines',
      'reviews',
      'custom_order_requests',
      'production_jobs',
      'audit_logs',
    ];

    for (const table of requiredTables) {
      const enableRegex = new RegExp(
        `ALTER\\s+TABLE\\s+"?${table}"?\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`,
        'i',
      );
      assert.ok(enableRegex.test(sql), `Table ${table} must have RLS enabled`);
    }
  });

  it('enforces multi-tenant customer isolation for orders and addresses (JN-124)', () => {
    const sql = readFileSync(migrationPath, 'utf8');

    // Customer order policy
    assert.ok(
      sql.includes('auth.uid() = customer_id'),
      'Orders must restrict customer read access to auth.uid() = customer_id',
    );

    // Customer address policy
    assert.ok(
      sql.includes('auth.uid() = user_id'),
      'Addresses must restrict access to auth.uid() = user_id',
    );
  });

  it('enforces craft-specific workshop floor isolation (TAILOR vs JEWELLER) (JN-125)', () => {
    const sql = readFileSync(migrationPath, 'utf8');

    // production_jobs artisan access
    assert.ok(
      sql.includes("'TAILOR'") && sql.includes("'JEWELLER'"),
      'Production jobs policy must recognize both TAILOR and JEWELLER roles',
    );
  });

  it('protects audit_logs with append-only insert and ADMIN-only select (JN-127)', () => {
    const sql = readFileSync(migrationPath, 'utf8');

    assert.ok(
      sql.includes('audit_logs_append') || sql.includes('audit_logs_insert'),
      'Audit logs must allow append-only inserts',
    );
    assert.ok(
      sql.includes("role = 'ADMIN'"),
      'Audit logs must restrict select access strictly to ADMIN role',
    );
  });
});
