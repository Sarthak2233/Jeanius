import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const ADMIN_AUTH_COOKIE = 'sb-admin-auth-token';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhY2Nlc3NfdG9rZW4iOiJsb2NhbC1hbm9uLWtleSJ9',
    {
      cookieOptions: {
        name: ADMIN_AUTH_COOKIE,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as CookieOptions);
            });
          } catch {
            // Ignored when called from Server Components
          }
        },
      },
    },
  );
}
