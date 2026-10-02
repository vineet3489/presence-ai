import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Public marketing pages need no session — skip the Supabase auth round trip so they load fast.
const PUBLIC_EXACT = new Set(['/', '/about', '/faq', '/privacy', '/terms', '/sitemap.xml', '/robots.txt']);
const isPublicPath = (p: string) => PUBLIC_EXACT.has(p) || p === '/blog' || p.startsWith('/blog/');

export async function middleware(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) return NextResponse.next();

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isProtected = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/face-scan') ||
    pathname.startsWith('/voice-check') ||
    pathname.startsWith('/date-prep') ||
    pathname.startsWith('/progress') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/roleplay') ||
    pathname.startsWith('/report') ||
    pathname.startsWith('/upgrade') ||
    pathname.startsWith('/style-profile') ||
    pathname.startsWith('/perception');

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/perception', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
