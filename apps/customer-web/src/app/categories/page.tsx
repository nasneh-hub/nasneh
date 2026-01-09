'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
import { useAuth } from '@/context/auth-context';
import { AppShell } from '@/components/layout/app-shell';

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
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-secondary)',
        }}
      >
        <div style={{ color: 'var(--text-secondary)' }}>{ar.ui.loading}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const categories = [
    { name: ar.categories.freshFood, icon: '🥗', description: 'منتجات طازجة يومياً' },
    { name: ar.categories.foodProducts, icon: '🍯', description: 'منتجات غذائية محلية' },
    { name: ar.categories.crafts, icon: '🎨', description: 'حرف ومنتجات يدوية' },
    { name: ar.categories.foodTrucks, icon: '🚚', description: 'عربات الطعام المتنقلة' },
    { name: ar.categories.services, icon: '✨', description: 'خدمات وإبداع محلي' },
  ];

  return (
    <AppShell>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <h1
            style={{
              fontSize: 'var(--font-size-h1)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-sm)',
            }}
          >
            التصنيفات
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-body)' }}>
            اكتشف منتجات وخدمات ناسنتنا حسب التصنيف
          </p>
        </div>

        {/* Categories Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--spacing-lg)',
          }}
        >
          {categories.map((category) => (
            <Card key={category.name} padding="lg">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-md)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  // TODO: Navigate to category page
                  console.log('Navigate to:', category.name);
                }}
              >
                <div
                  style={{
                    fontSize: '3rem',
                    textAlign: 'center',
                  }}
                >
                  {category.icon}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 'var(--font-size-h4)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--spacing-xs)',
                      textAlign: 'center',
                    }}
                  >
                    {category.name}
                  </h3>
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--font-size-small)',
                      textAlign: 'center',
                    }}
                  >
                    {category.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Coming Soon Message */}
        <div style={{ marginTop: 'var(--spacing-3xl)', textAlign: 'center' }}>
          <Card padding="lg">
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-body)' }}>
              قريباً: المزيد من المنتجات والخدمات في كل تصنيف
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
