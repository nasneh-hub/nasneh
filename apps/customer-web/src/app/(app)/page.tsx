'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@nasneh/ui';
import { AppShell } from '@/components/layout/app-shell';
import { Search } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

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
          gap: 'var(--spacing-2xl)',
          background: 'var(--bg-secondary)',
          padding: 'var(--spacing-3xl) var(--spacing-lg)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-xl)',
          }}
        >
          <h1
            style={{
              fontSize: 'var(--font-size-4xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Discover Local Kitchens, Craft & Services
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            From us, for us — Your marketplace for authentic homemade food, handcrafted products, and trusted local services.
          </p>

          {/* Search Bar */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              maxWidth: '600px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                flex: 1,
                position: 'relative',
              }}
            >
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: 'var(--spacing-md)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                }}
              />
              <input
                type="text"
                placeholder="Search for kitchens, products, or services..."
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-md) var(--spacing-3xl)',
                  borderRadius: 'var(--radius-standard)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-base)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <Button
              variant="default"
              size="lg"
              onClick={() => router.push('/categories')}
            >
              Browse Categories
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section
        style={{
          padding: 'var(--spacing-3xl) var(--spacing-lg)',
          background: 'var(--bg-primary)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-2xl)',
              textAlign: 'center',
            }}
          >
            Featured Categories
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-xl)',
            }}
          >
            {[
              { name: 'Kitchens', description: 'Homemade meals & catering' },
              { name: 'Craft', description: 'Handmade products & art' },
              { name: 'Products', description: 'Local goods & essentials' },
              { name: 'Food Trucks', description: 'Street food & mobile kitchens' },
              { name: 'Services', description: 'Bookable local services' },
            ].map((category) => (
              <div
                key={category.name}
                onClick={() => router.push('/categories')}
                style={{
                  padding: 'var(--spacing-xl)',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-standard)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <h3
                  style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--spacing-sm)',
                  }}
                >
                  {category.name}
                </h3>
                <p
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-secondary)',
                    margin: 0,
                  }}
                >
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
