'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Avatar, Button, Card } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import {
  User,
  Package,
  Calendar,
  Star,
  MapPin,
  Heart,
  Headphones,
  ChevronRight,
} from 'lucide-react';

export default function AccountOverviewPage() {
  const router = useRouter();
  const { user } = useAuth();

  const getInitials = () => {
    if (!user?.phone) return 'U';
    return user.phone.slice(-2).toUpperCase();
  };

  const quickLinks = [
    {
      icon: User,
      label: en.profile.myProfile,
      description: 'Manage your personal information',
      href: '/me/profile',
    },
    {
      icon: Package,
      label: en.orders.myOrders,
      description: 'View your order history',
      href: '/me/orders',
    },
    {
      icon: Calendar,
      label: en.bookings.myBookings,
      description: 'Manage your service bookings',
      href: '/me/bookings',
    },
    {
      icon: Star,
      label: en.reviews.myReviews,
      description: 'See your reviews',
      href: '/me/reviews',
    },
    {
      icon: MapPin,
      label: en.profile.myAddresses,
      description: 'Manage delivery addresses',
      href: '/me/addresses',
    },
    {
      icon: Heart,
      label: en.wishlist.myWishlist,
      description: 'View your saved items',
      href: '/me/wishlist',
    },
    {
      icon: Headphones,
      label: en.support.support,
      description: 'Get help and support',
      href: '/me/support',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          {en.profile.myProfile}
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Manage your account settings and preferences
        </p>
      </div>

      {/* User Info Card */}
      <Card className="mb-8 p-6">
        <div className="flex items-center gap-4">
          <Avatar name={getInitials()} size="lg" />
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              {user?.phone || 'Guest'}
            </h2>
            <p className="text-[var(--muted-foreground)]">
              {user?.role === 'ADMIN' ? 'Admin' : 'Customer'}
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Card
              key={link.href}
              className="p-6 cursor-pointer hover:bg-[var(--secondary)] transition-colors"
              onClick={() => router.push(link.href)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-[var(--muted)]">
                  <Icon size={24} className="text-[var(--primary)]" />
                </div>
                <ChevronRight size={20} className="text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
                {link.label}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                {link.description}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
