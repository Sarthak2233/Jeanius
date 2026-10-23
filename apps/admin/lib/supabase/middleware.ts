import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createLogger } from '@jeanius/observability';

export const ADMIN_AUTH_COOKIE = 'sb-admin-auth-token';

const logger = createLogger('admin:middleware:guard');

export async function updateAdminSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhY2Nlc3NfdG9rZW4iOiJsb2NhbC1hbm9uLWtleSJ9',
    {
      cookieOptions: {
        name: ADMIN_AUTH_COOKIE,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const role = (user?.user_metadata?.role as string) ?? '';
  const allowedStaffRoles = ['ADMIN', 'JEWELLER', 'FULFILLMENT', 'SUPPORT'];
  const isStaffRole = allowedStaffRoles.includes(role);

  // Allow login page and auth callbacks
  if (pathname === '/login' || pathname.startsWith('/auth')) {
    if (user && pathname === '/login' && isStaffRole) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // All other admin routes require authenticated staff account
  if (!user) {
    logger.info('Unauthenticated request redirected to admin login', { pathname });
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Global Staff Guard: Reject non-staff accounts (CUSTOMER, MEMBER, GUEST) from all admin routes
  if (!isStaffRole) {
    logger.warn('Non-staff customer account rejected from admin workbench', {
      pathname,
      userId: user.id,
      role,
    });
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('error', 'unauthorized_customer');
    return NextResponse.redirect(url);
  }

  // Strict RBAC Sub-path Guarding:
  // 1. Jewellery metalsmith workshop: JEWELLER or ADMIN
  if (pathname.startsWith('/workshop/jeweller')) {
    if (role !== 'JEWELLER' && role !== 'ADMIN') {
      logger.warn('RBAC forbidden: Jewellery metalsmith bench access denied', {
        pathname,
        userId: user.id,
        role,
        requiredRoles: ['JEWELLER', 'ADMIN'],
      });
      return new NextResponse('Forbidden: Jewellery silversmith bench access only.', {
        status: 403,
      });
    }
  }

  // 2. Fulfillment warehouse: FULFILLMENT or ADMIN
  if (pathname.startsWith('/fulfillment')) {
    if (role !== 'FULFILLMENT' && role !== 'ADMIN') {
      logger.warn('RBAC forbidden: Fulfillment station access denied', {
        pathname,
        userId: user.id,
        role,
        requiredRoles: ['FULFILLMENT', 'ADMIN'],
      });
      return new NextResponse('Forbidden: Fulfillment station access only.', { status: 403 });
    }
  }

  // 3. Customer Support desk: SUPPORT or ADMIN
  if (pathname.startsWith('/support')) {
    if (role !== 'SUPPORT' && role !== 'ADMIN') {
      logger.warn('RBAC forbidden: Customer support desk access denied', {
        pathname,
        userId: user.id,
        role,
        requiredRoles: ['SUPPORT', 'ADMIN'],
      });
      return new NextResponse('Forbidden: Customer support desk access only.', { status: 403 });
    }
  }

  // 4. Categories, Financials, Ledger, Staff Management: ADMIN strictly
  if (
    pathname.startsWith('/categories') ||
    pathname.startsWith('/financials') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/settings')
  ) {
    if (role !== 'ADMIN') {
      logger.warn('RBAC forbidden: Administrative section access denied', {
        pathname,
        userId: user.id,
        role,
        requiredRoles: ['ADMIN'],
      });
      return new NextResponse('Forbidden: Administrative access required.', { status: 403 });
    }
  }

  return supabaseResponse;
}
