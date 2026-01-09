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
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-[var(--spacing-2xl)] bg-[var(--bg-secondary)] px-[var(--spacing-lg)] py-[var(--spacing-3xl)] text-center">
        <div className="flex max-w-[800px] flex-col gap-[var(--spacing-xl)]">
          <h1 className="m-0 text-[length:var(--font-size-4xl)] font-[var(--font-weight-bold)] leading-[1.2] text-[var(--text-primary)]">
            Discover Local Kitchens, Craft & Services
          </h1>
          <p className="m-0 text-[length:var(--font-size-lg)] leading-[1.6] text-[var(--text-secondary)]">
            From us, for us — Your marketplace for authentic homemade food, handcrafted products, and trusted local services.
          </p>

          {/* Search Bar */}
          <div className="mx-auto flex w-full max-w-[600px] gap-[var(--spacing-md)]">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-[var(--spacing-md)] top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              />
              <input
                type="text"
                placeholder="Search for kitchens, products, or services..."
                className="w-full rounded-[var(--radius-standard)] border border-[var(--border-primary)] bg-[var(--bg-primary)] py-[var(--spacing-md)] pl-[var(--spacing-3xl)] pr-[var(--spacing-md)] text-[length:var(--font-size-base)] text-[var(--text-primary)] outline-none"
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
      <section className="bg-[var(--bg-primary)] px-[var(--spacing-lg)] py-[var(--spacing-3xl)]">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-[var(--spacing-2xl)] text-center text-[length:var(--font-size-2xl)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Featured Categories
          </h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[var(--spacing-xl)]">
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
                className="cursor-pointer rounded-[var(--radius-standard)] bg-[var(--bg-secondary)] p-[var(--spacing-xl)] transition-transform duration-200 hover:-translate-y-1"
              >
                <h3 className="mb-[var(--spacing-sm)] text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                  {category.name}
                </h3>
                <p className="m-0 text-[length:var(--font-size-sm)] text-[var(--text-secondary)]">
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
