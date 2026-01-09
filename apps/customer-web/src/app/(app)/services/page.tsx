'use client';

import React from 'react';
import { Skeleton } from '@nasneh/ui';

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-[1440px] p-[var(--spacing-2xl)]">
      <div className="py-[var(--spacing-4xl)] text-center">
        <h1 className="mb-[var(--spacing-md)] text-[length:var(--font-size-3xl)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
          Services
        </h1>
        <p className="mb-[var(--spacing-2xl)] text-[length:var(--font-size-lg)] text-[var(--text-secondary)]">
          Book services from local professionals
        </p>
        <div className="inline-block rounded-[var(--radius-xl)] bg-[var(--bg-secondary)] px-[var(--spacing-xl)] py-[var(--spacing-md)]">
          <p className="m-0 text-[length:var(--font-size-base)] text-[var(--text-tertiary)]">
            Coming soon
          </p>
        </div>
      </div>

      {/* Skeleton placeholders */}
      <div className="mt-[var(--spacing-2xl)] grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[var(--spacing-lg)]">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[300px] rounded-[var(--radius-xl)]" />
        ))}
      </div>
    </div>
  );
}
