import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const ADMIN_AUTH_COOKIE = 'sb-admin-auth-token';

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
  const allowedStaffRoles = ['ADMIN', 'TAILOR', 'JEWELLER', 'FULFILLMENT', 'SUPPORT'];
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
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Global Staff Guard: Reject non-staff accounts (CUSTOMER, MEMBER, GUEST) from all admin routes
  if (!isStaffRole) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('error', 'unauthorized_customer');
    return NextResponse.redirect(url);
  }

  // Strict RBAC Sub-path Guarding (JN-125):
  // 1. Denim workshop: TAILOR or ADMIN
  if (pathname.startsWith('/workshop/tailor')) {
    if (role !== 'TAILOR' && role !== 'ADMIN') {
      return new NextResponse('Forbidden: Denim tailoring bench access only.', { status: 403 });
    }
  }

  // 2. Jewellery metalsmith workshop: JEWELLER or ADMIN
  if (pathname.startsWith('/workshop/jeweller')) {
    if (role !== 'JEWELLER' && role !== 'ADMIN') {
      return new NextResponse('Forbidden: Jewellery silversmith bench access only.', {
        status: 403,
      });
    }
  }

  // 3. Fulfillment warehouse: FULFILLMENT or ADMIN
  if (pathname.startsWith('/fulfillment')) {
    if (role !== 'FULFILLMENT' && role !== 'ADMIN') {
      return new NextResponse('Forbidden: Fulfillment station access only.', { status: 403 });
    }
  }

  // 4. Customer Support desk: SUPPORT or ADMIN
  if (pathname.startsWith('/support')) {
    if (role !== 'SUPPORT' && role !== 'ADMIN') {
      return new NextResponse('Forbidden: Customer support desk access only.', { status: 403 });
    }
  }

  // 5. Financials, Ledger, Staff Management: ADMIN strictly
  if (
    pathname.startsWith('/financials') ||
    pathname.startsWith('/staff') ||
    pathname.startsWith('/settings')
  ) {
    if (role !== 'ADMIN') {
      return new NextResponse('Forbidden: Administrative access required.', { status: 403 });
    }
  }

  return supabaseResponse;
}
