'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
import { useAuth } from '@/context/auth-context';
import { AppShell } from '@/components/layout/app-shell';
import { Search, TrendingUp, Package, Sparkles } from 'lucide-react';

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
      {/* Hero Section */}
      <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <h1
            style={{
              fontSize: 'var(--font-size-h1)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            {ar.auth.welcome}
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'var(--font-size-large)',
              marginBottom: 'var(--spacing-xl)',
            }}
          >
            {ar.taglines.primary}
          </p>

          {/* Search Bar */}
          <div
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              position: 'relative',
            }}
          >
            <input
              type="text"
              placeholder="ابحث عن منتجات وخدمات..."
              style={{
                width: '100%',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                paddingRight: 'calc(var(--spacing-lg) + 24px + var(--spacing-md))',
                fontSize: 'var(--font-size-base)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: `1px solid var(--border-primary)`,
                outline: 'none',
                transition: 'all 0.2s',
              }}
              className="rounded-xl focus:ring-[length:var(--ring-width)] focus:ring-[color:var(--ring-color)]"
            />
            <Search
              size={20}
              style={{
                position: 'absolute',
                right: 'var(--spacing-lg)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Featured Categories (Horizontal Scroll) */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            overflowX: 'auto',
            padding: 'var(--spacing-sm) 0',
          }}
        >
          {[
            { name: 'إلكترونيات', icon: '💻' },
            { name: 'أزياء', icon: '👔' },
            { name: 'منزل', icon: '🏠' },
            { name: 'رياضة', icon: '⚽' },
            { name: 'كتب', icon: '📚' },
            { name: 'ألعاب', icon: '🎮' },
          ].map((category) => (
            <button
              key={category.name}
              onClick={() => router.push(`/categories?name=${category.name}`)}
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                background: 'var(--bg-primary)',
                border: `1px solid var(--border-primary)`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: 'var(--font-size-base)',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
              }}
              className="rounded-xl hover:bg-[var(--bg-hover)]"
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-h2)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}
          >
            <Sparkles size={24} style={{ color: 'var(--primary)' }} />
            {ar.ui.featuredNasneh}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => router.push('/featured')}>
            عرض الكل
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton variant="rectangle" width="full" height="xl" />
              </CardHeader>
              <CardContent>
                <Skeleton width="3/4" height="md" style={{ marginBottom: 'var(--spacing-sm)' }} />
                <Skeleton width="1/2" height="sm" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-h2)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}
          >
            <TrendingUp size={24} style={{ color: 'var(--primary)' }} />
            الأكثر رواجاً
          </h2>
          <Button variant="ghost" size="sm" onClick={() => router.push('/trending')}>
            عرض الكل
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton variant="rectangle" width="full" height="lg" />
              </CardHeader>
              <CardContent>
                <Skeleton width="full" height="md" style={{ marginBottom: 'var(--spacing-sm)' }} />
                <Skeleton width="1/2" height="sm" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h2
          style={{
            fontSize: 'var(--font-size-h2)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
            textAlign: 'center',
            marginBottom: 'var(--spacing-xl)',
          }}
        >
          كيف يعمل ناسنه؟
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Search size={48} style={{ color: 'var(--primary)' }} />,
              title: 'ابحث',
              description: 'ابحث عن المنتجات والخدمات التي تحتاجها',
            },
            {
              icon: <Package size={48} style={{ color: 'var(--primary)' }} />,
              title: 'اطلب',
              description: 'اطلب من البائعين الموثوقين',
            },
            {
              icon: <TrendingUp size={48} style={{ color: 'var(--primary)' }} />,
              title: 'استمتع',
              description: 'احصل على طلبك بسرعة وأمان',
            },
          ].map((step, index) => (
            <Card key={index}>
              <CardContent style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>{step.icon}</div>
                <h3
                  style={{
                    fontSize: 'var(--font-size-h3)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--spacing-sm)',
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-base)' }}>
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          background: 'var(--accent)',
          padding: 'var(--spacing-2xl)',
          textAlign: 'center',
        }}
        className="rounded-xl"
      >
        <h2
          style={{
            fontSize: 'var(--font-size-h2)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          هل أنت بائع؟
        </h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-large)',
            marginBottom: 'var(--spacing-xl)',
          }}
        >
          ابدأ البيع على ناسنه واصل إلى آلاف المشترين
        </p>
        <Button variant="default" size="lg" onClick={() => router.push('/sell')}>
          ابدأ البيع الآن
        </Button>
      </section>
    </AppShell>
  );
}
