import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /categories/[slug] to /category/[slug] for consistency
  if (pathname.startsWith('/categories/') && pathname !== '/categories') {
    const slug = pathname.replace('/categories/', '');
    return NextResponse.redirect(new URL(`/category/${slug}`, request.url));
  }

  // Redirect /kitchens to /categories (main listing page)
  if (pathname === '/kitchens') {
    return NextResponse.redirect(new URL('/categories', request.url));
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
    '/categories/:path*',
    '/kitchens',
    '/sell',
  ],
};
