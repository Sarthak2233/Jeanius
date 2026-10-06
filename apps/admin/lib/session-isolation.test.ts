import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monorepoRoot = path.resolve(__dirname, '../../..');

describe('Diagnosing Auth & Middleware Session Sharing Bug', () => {
  it('BUG 1: apps/admin and apps/storefront have identical Supabase cookie storage keys (collision)', () => {
    const storefrontServerPath = path.resolve(
      monorepoRoot,
      'apps/storefront/lib/supabase/server.ts',
    );
    const storefrontMiddlewarePath = path.resolve(
      monorepoRoot,
      'apps/storefront/lib/supabase/middleware.ts',
    );
    const adminServerPath = path.resolve(monorepoRoot, 'apps/admin/lib/supabase/server.ts');
    const adminMiddlewarePath = path.resolve(monorepoRoot, 'apps/admin/lib/supabase/middleware.ts');

    const sfServerCode = fs.readFileSync(storefrontServerPath, 'utf8');
    const sfMwCode = fs.readFileSync(storefrontMiddlewarePath, 'utf8');
    const admServerCode = fs.readFileSync(adminServerPath, 'utf8');
    const admMwCode = fs.readFileSync(adminMiddlewarePath, 'utf8');

    // Both apps MUST isolate their cookie names so localhost ports 3000 & 3001 do not overwrite each other
    const sfHasCookieName =
      sfServerCode.includes('cookieOptions') && sfMwCode.includes('cookieOptions');
    const admHasCookieName =
      admServerCode.includes('cookieOptions') && admMwCode.includes('cookieOptions');

    // Currently neither specifies cookieOptions.name, causing default collision on localhost
    assert.ok(sfHasCookieName, 'apps/storefront must define distinct cookieOptions.name');
    assert.ok(admHasCookieName, 'apps/admin must define distinct cookieOptions.name');
  });

  it('BUG 2: apps/admin/lib/supabase/middleware.ts allows non-staff role (CUSTOMER) to access root and non-workshop admin routes', () => {
    const adminMiddlewarePath = path.resolve(monorepoRoot, 'apps/admin/lib/supabase/middleware.ts');
    const admMwCode = fs.readFileSync(adminMiddlewarePath, 'utf8');

    // Check if middleware enforces staff role check globally for all protected admin routes
    // Staff roles: ADMIN, TAILOR, JEWELLER, FULFILLMENT, SUPPORT
    const hasGlobalStaffCheck =
      admMwCode.includes('isStaff') ||
      admMwCode.includes('allowedStaffRoles') ||
      admMwCode.includes('CUSTOMER');

    assert.ok(
      hasGlobalStaffCheck,
      'apps/admin/lib/supabase/middleware.ts must guard all admin routes against non-staff accounts (CUSTOMER/MEMBER)',
    );
  });
});
