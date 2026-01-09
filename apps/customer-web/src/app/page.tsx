'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Logo } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
import { useAuth } from '@/context/auth-context';
import { AppShell } from '@/components/layout/app-shell';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
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
    return null; // Will redirect
  }

  return (
    <AppShell>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <h1
            style={{
              fontSize: 'var(--font-size-h1)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-sm)',
            }}
          >
            {ar.auth.welcome}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-body)' }}>
            {ar.taglines.primary}
          </p>
        </div>

        {/* User Info Card */}
        <Card padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div>
              <h2
                style={{
                  fontSize: 'var(--font-size-h3)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--spacing-sm)',
                }}
              >
                {ar.profile.title}
              </h2>
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-standard)',
                  padding: 'var(--spacing-lg)',
                  display: 'inline-block',
                }}
              >
                <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--text-secondary)' }}>
                  {ar.auth.phone}:{' '}
                  <span
                    style={{
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text-primary)',
                    }}
                    dir="ltr"
                  >
                    {user?.phone}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3
                style={{
                  fontSize: 'var(--font-size-h4)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--spacing-md)',
                }}
              >
                إجراءات سريعة
              </h3>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                <Button variant="default" size="md" onClick={() => router.push('/categories')}>
                  {ar.cta.browseNasneh}
                </Button>
                <Button variant="secondary" size="md" onClick={() => router.push('/profile')}>
                  {ar.profile.title}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Placeholder Sections */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginTop: 'var(--spacing-2xl)',
          }}
        >
          {/* Featured Section */}
          <Card padding="lg">
            <h3
              style={{
                fontSize: 'var(--font-size-h4)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              {ar.ui.featuredNasneh}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-small)' }}>
              قريباً: منتجات وخدمات مميزة من ناسنتنا
            </p>
          </Card>

          {/* Categories Section */}
          <Card padding="lg">
            <h3
              style={{
                fontSize: 'var(--font-size-h4)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              التصنيفات
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-small)' }}>
              قريباً: تصفح حسب التصنيفات
            </p>
          </Card>

          {/* Recent Section */}
          <Card padding="lg">
            <h3
              style={{
                fontSize: 'var(--font-size-h4)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              الأحدث
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-small)' }}>
              قريباً: آخر المنتجات والخدمات
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
