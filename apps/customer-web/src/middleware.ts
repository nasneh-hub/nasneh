import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /categories to /category
  if (pathname === '/categories') {
    return NextResponse.redirect(new URL('/category', request.url));
  }

  // Redirect /categories/[slug] to /category/[slug]
  if (pathname.startsWith('/categories/')) {
    const slug = pathname.replace('/categories/', '');
    return NextResponse.redirect(new URL(`/category/${slug}`, request.url));
  }

  // Redirect /kitchens to /category (or /category/home-kitchen if that's the slug)
  if (pathname === '/kitchens') {
    return NextResponse.redirect(new URL('/category', request.url));
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
    '/categories',
    '/categories/:path*',
    '/kitchens',
    '/sell',
  ],
};
