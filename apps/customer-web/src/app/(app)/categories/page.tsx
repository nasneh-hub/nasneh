'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
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
          <p style={{ color: 'var(--text-secondary)' }}>{ar.ui.loading}</p>
        </div>
      </AppShell>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const categories = [
    {
      name: ar.categories.freshFood,
      icon: <Salad size={48} style={{ color: 'var(--primary)' }} />,
      description: 'منتجات طازجة يومياً',
      count: 0,
    },
    {
      name: ar.categories.foodProducts,
      icon: <Cookie size={48} style={{ color: 'var(--primary)' }} />,
      description: 'منتجات غذائية محلية',
      count: 0,
    },
    {
      name: ar.categories.crafts,
      icon: <Palette size={48} style={{ color: 'var(--primary)' }} />,
      description: 'حرف ومنتجات يدوية',
      count: 0,
    },
    {
      name: ar.categories.foodTrucks,
      icon: <Truck size={48} style={{ color: 'var(--primary)' }} />,
      description: 'عربات الطعام المتنقلة',
      count: 0,
    },
    {
      name: ar.categories.services,
      icon: <Sparkles size={48} style={{ color: 'var(--primary)' }} />,
      description: 'خدمات وإبداع محلي',
      count: 0,
    },
    {
      name: 'أخرى',
      icon: <Grid3x3 size={48} style={{ color: 'var(--primary)' }} />,
      description: 'تصنيفات إضافية',
      count: 0,
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
          التصنيفات
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-large)' }}>
          اكتشف منتجات وخدمات ناسنتنا حسب التصنيف
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
              onClick={() => {
                // TODO: Navigate to category page
                console.log('Navigate to:', category.name);
              }}
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
                  {category.count} منتج
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
              قريباً
            </h3>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-base)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              المزيد من المنتجات والخدمات في كل تصنيف
            </p>
            <Button variant="default" size="md" onClick={() => router.push('/')}>
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
