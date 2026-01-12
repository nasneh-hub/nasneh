import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect old /category/[slug] to new /categories/[slug] for consistency
  if (pathname.startsWith('/category/') && pathname !== '/category') {
    const slug = pathname.replace('/category/', '');
    return NextResponse.redirect(new URL(`/categories/${slug}`, request.url));
  }

  // Redirect /sell to onboarding page (placeholder for now)
  if (pathname === '/sell') {
    // TODO: Update this to actual onboarding page when implemented
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/category/:path*',
    '/sell',
  ],
};
