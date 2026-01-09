'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Button } from '@nasneh/ui';
import { useAuth } from '@/context/auth-context';
import { AppShell } from '@/components/layout/app-shell';
import { Salad, Cookie, Palette, Truck, Sparkles, Grid3x3 } from 'lucide-react';

export default function CategoriesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-[var(--spacing-2xl)] text-center">
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </AppShell>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const categories = [
    {
      name: 'Kitchens',
      icon: <Salad size={48} className="text-[var(--primary)]" />,
      description: 'Fresh homemade meals daily',
      count: 0,
      href: '/kitchens',
    },
    {
      name: 'Food Products',
      icon: <Cookie size={48} className="text-[var(--primary)]" />,
      description: 'Local food products and treats',
      count: 0,
      href: '/products',
    },
    {
      name: 'Craft',
      icon: <Palette size={48} className="text-[var(--primary)]" />,
      description: 'Handcrafted items and art',
      count: 0,
      href: '/craft',
    },
    {
      name: 'Food Trucks',
      icon: <Truck size={48} className="text-[var(--primary)]" />,
      description: 'Mobile food vendors',
      count: 0,
      href: '/food-trucks',
    },
    {
      name: 'Services',
      icon: <Sparkles size={48} className="text-[var(--primary)]" />,
      description: 'Local services and bookings',
      count: 0,
      href: '/services',
    },
    {
      name: 'Other',
      icon: <Grid3x3 size={48} className="text-[var(--primary)]" />,
      description: 'Additional categories',
      count: 0,
      href: '/other',
    },
  ];

  return (
    <AppShell>
      {/* Page Header */}
      <div className="mb-[var(--spacing-2xl)]">
        <h1 className="mb-[var(--spacing-sm)] text-[length:var(--font-size-h1)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
          Categories
        </h1>
        <p className="text-[length:var(--font-size-large)] text-[var(--text-secondary)]">
          Discover products and services by category
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.name}>
            <CardContent
              className="cursor-pointer p-[var(--spacing-xl)] transition-all duration-200 hover:bg-[var(--bg-hover)]"
              onClick={() => router.push(category.href)}
            >
              <div className="flex flex-col items-center gap-[var(--spacing-md)] text-center">
                {/* Icon */}
                <div className="mb-[var(--spacing-sm)]">{category.icon}</div>

                {/* Title */}
                <h3 className="text-[length:var(--font-size-h3)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                  {category.name}
                </h3>

                {/* Description */}
                <p className="text-[length:var(--font-size-base)] text-[var(--text-secondary)]">
                  {category.description}
                </p>

                {/* Count Badge */}
                <div className="rounded-full bg-[var(--bg-tertiary)] px-[var(--spacing-md)] py-[var(--spacing-xs)] text-[length:var(--font-size-small)] text-[var(--text-secondary)]">
                  {category.count} items
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      <div className="mt-[var(--spacing-2xl)] text-center">
        <Card>
          <CardContent className="p-[var(--spacing-2xl)]">
            <Grid3x3 size={48} className="mx-auto mb-[var(--spacing-lg)] text-[var(--text-tertiary)]" />
            <h3 className="mb-[var(--spacing-sm)] text-[length:var(--font-size-h3)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
              Coming Soon
            </h3>
            <p className="mb-[var(--spacing-lg)] text-[length:var(--font-size-base)] text-[var(--text-secondary)]">
              More products and services in each category
            </p>
            <Button variant="default" size="md" onClick={() => router.push('/')}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
