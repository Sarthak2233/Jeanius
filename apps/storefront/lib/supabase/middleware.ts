import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createLogger } from '@jeanius/observability';

export const STOREFRONT_AUTH_COOKIE = 'sb-storefront-auth-token';

const logger = createLogger('storefront:middleware:guard');

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhY2Nlc3NfdG9rZW4iOiJsb2NhbC1hbm9uLWtleSJ9',
    {
      cookieOptions: {
        name: STOREFRONT_AUTH_COOKIE,
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

  // Refresh auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected route checking:
  // 1. /account/* requires authenticated user
  if (pathname.startsWith('/account') && !user) {
    logger.info('Unauthenticated customer redirected to login from account area', {
      pathname,
    });
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 2. /member/* requires MEMBER or ADMIN role
  if (pathname.startsWith('/member')) {
    if (!user) {
      logger.info('Unauthenticated visitor redirected from member salon', {
        pathname,
      });
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }

    const role = user.user_metadata?.role;
    if (role !== 'MEMBER' && role !== 'ADMIN') {
      logger.warn('Non-member customer blocked from VIP member drop salon', {
        pathname,
        userId: user.id,
        role,
      });
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
