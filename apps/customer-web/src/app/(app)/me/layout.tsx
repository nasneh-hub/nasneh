'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { en } from '@nasneh/ui/copy';
import {
  User,
  Package,
  Calendar,
  Star,
  MapPin,
  Heart,
  Headphones,
} from 'lucide-react';

interface MeLayoutProps {
  children: React.ReactNode;
}

export default function MeLayout({ children }: MeLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      icon: User,
      label: en.profile.myProfile,
      href: '/me/profile',
    },
    {
      icon: Package,
      label: en.orders.myOrders,
      href: '/me/orders',
    },
    {
      icon: Calendar,
      label: en.bookings.myBookings,
      href: '/me/bookings',
    },
    {
      icon: Star,
      label: en.reviews.myReviews,
      href: '/me/reviews',
    },
    {
      icon: MapPin,
      label: en.profile.myAddresses,
      href: '/me/addresses',
    },
    {
      icon: Heart,
      label: en.wishlist.myWishlist,
      href: '/me/wishlist',
    },
    {
      icon: Headphones,
      label: en.support.support,
      href: '/me/support',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/me') {
      return pathname === '/me';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-colors duration-200 text-left
                      ${
                        active
                          ? 'bg-[var(--primary)] text-[var(--text-on-primary)]'
                          : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Mobile Navigation (Horizontal Scroll) */}
          <div className="lg:hidden overflow-x-auto -mx-4 px-4 mb-4">
            <div className="flex gap-2 min-w-max">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl
                      whitespace-nowrap transition-colors duration-200
                      ${
                        active
                          ? 'bg-[var(--primary)] text-[var(--text-on-primary)]'
                          : 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--secondary)]'
                      }
                    `}
                  >
                    <Icon size={16} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
