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
        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
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
      icon: <Salad size={48} style={{ color: 'var(--primary)' }} />,
      description: 'Fresh homemade meals daily',
      count: 0,
      href: '/kitchens',
    },
    {
      name: 'Food Products',
      icon: <Cookie size={48} style={{ color: 'var(--primary)' }} />,
      description: 'Local food products and treats',
      count: 0,
      href: '/products',
    },
    {
      name: 'Craft',
      icon: <Palette size={48} style={{ color: 'var(--primary)' }} />,
      description: 'Handcrafted items and art',
      count: 0,
      href: '/craft',
    },
    {
      name: 'Food Trucks',
      icon: <Truck size={48} style={{ color: 'var(--primary)' }} />,
      description: 'Mobile food vendors',
      count: 0,
      href: '/food-trucks',
    },
    {
      name: 'Services',
      icon: <Sparkles size={48} style={{ color: 'var(--primary)' }} />,
      description: 'Local services and bookings',
      count: 0,
      href: '/services',
    },
    {
      name: 'Other',
      icon: <Grid3x3 size={48} style={{ color: 'var(--primary)' }} />,
      description: 'Additional categories',
      count: 0,
      href: '/other',
    },
  ];

  return (
    <AppShell>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1
          style={{
            fontSize: 'var(--font-size-h1)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-sm)',
          }}
        >
          Categories
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-large)' }}>
          Discover products and services by category
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.name}>
            <CardContent
              style={{
                padding: 'var(--spacing-xl)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              className="hover:bg-[var(--bg-hover)]"
              onClick={() => router.push(category.href)}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  textAlign: 'center',
                }}
              >
                {/* Icon */}
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>{category.icon}</div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: 'var(--font-size-h3)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {category.name}
                </h3>

                {/* Description */}
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--font-size-base)',
                  }}
                >
                  {category.description}
                </p>

                {/* Count Badge */}
                <div
                  style={{
                    padding: 'var(--spacing-xs) var(--spacing-md)',
                    background: 'var(--bg-tertiary)',
                    fontSize: 'var(--font-size-small)',
                    color: 'var(--text-secondary)',
                  }}
                  className="rounded-full"
                >
                  {category.count} items
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      <div style={{ marginTop: 'var(--spacing-2xl)', textAlign: 'center' }}>
        <Card>
          <CardContent style={{ padding: 'var(--spacing-2xl)' }}>
            <Grid3x3 size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--spacing-lg)' }} />
            <h3
              style={{
                fontSize: 'var(--font-size-h3)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-sm)',
              }}
            >
              Coming Soon
            </h3>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-base)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
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
