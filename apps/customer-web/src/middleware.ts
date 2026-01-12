import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect old /categories/* to new flat structure
  if (pathname.startsWith('/categories/')) {
    const slug = pathname.replace('/categories/', '');
    
    // Map old category slugs to new URLs
    const categoryMap: Record<string, string> = {
      'kitchens': '/kitchens',
      'craft': '/craft',
      'products': '/market',
      'market': '/market',
      'food-trucks': '/food-trucks',
      'services': '/services',
    };

    const newPath = categoryMap[slug] || `/${slug}`;
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Redirect old /category/[slug] to new structure
  if (pathname.startsWith('/category/') && pathname !== '/category') {
    const slug = pathname.replace('/category/', '');
    
    // Map to new category URLs
    const categoryMap: Record<string, string> = {
      'kitchens': '/kitchens',
      'craft': '/craft',
      'products': '/market',
      'market': '/market',
      'food-trucks': '/food-trucks',
      'services': '/services',
    };

    const newPath = categoryMap[slug] || `/${slug}`;
    return NextResponse.redirect(new URL(newPath, request.url));
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
    '/category/:path*',
    '/sell',
  ],
};
