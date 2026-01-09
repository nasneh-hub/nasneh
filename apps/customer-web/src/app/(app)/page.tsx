'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@nasneh/ui';
import { useAuth } from '@/context/auth-context';
import { AppShell } from '@/components/layout/app-shell';
import { Search } from 'lucide-react';

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
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <AppShell>
      {/* Hero Section */}
      <section
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: 'var(--spacing-2xl) 0',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-lg)',
            maxWidth: '800px',
          }}
        >
          Discover Local Kitchens, Craft & Services
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-large)',
            marginBottom: 'var(--spacing-2xl)',
            maxWidth: '600px',
          }}
        >
          From us, for us — Your marketplace for homemade food, handcrafted products, and trusted services
        </p>

        {/* Search Bar */}
        <div
          style={{
            maxWidth: '600px',
            width: '100%',
            position: 'relative',
            marginBottom: 'var(--spacing-xl)',
          }}
        >
          <input
            type="text"
            placeholder="Search for products and services..."
            style={{
              width: '100%',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              paddingLeft: 'calc(var(--spacing-lg) + 24px + var(--spacing-md))',
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
              left: 'var(--spacing-lg)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* CTA Button */}
        <Button
          variant="default"
          size="lg"
          onClick={() => router.push('/categories')}
        >
          Browse Categories
        </Button>
      </section>

      {/* Featured Categories Section */}
      <section style={{ padding: 'var(--spacing-2xl) 0' }}>
        <h2
          style={{
            fontSize: 'var(--font-size-h2)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-xl)',
            textAlign: 'center',
          }}
        >
          Explore Categories
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: 'Kitchens', href: '/kitchens' },
            { name: 'Craft', href: '/craft' },
            { name: 'Products', href: '/products' },
            { name: 'Food Trucks', href: '/food-trucks' },
            { name: 'Services', href: '/services' },
          ].map((category) => (
            <button
              key={category.name}
              onClick={() => router.push(category.href)}
              style={{
                padding: 'var(--spacing-xl)',
                background: 'var(--bg-primary)',
                border: `1px solid var(--border-primary)`,
                cursor: 'pointer',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
                textAlign: 'center',
              }}
              className="rounded-xl hover:bg-[var(--bg-hover)]"
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
