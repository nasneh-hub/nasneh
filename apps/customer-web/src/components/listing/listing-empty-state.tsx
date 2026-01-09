'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';

interface ListingEmptyStateProps {
  type: 'products' | 'services';
}

export function ListingEmptyState({ type }: ListingEmptyStateProps) {
  const router = useRouter();

  const title = type === 'products' ? en.listing.noProducts : en.listing.noServices;

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-[var(--spacing-lg)] rounded-[var(--radius-xl)] bg-[var(--bg-secondary)] p-[var(--spacing-2xl)]">
      <div className="text-center">
        <h2 className="mb-[var(--spacing-md)] text-[length:var(--font-size-2xl)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="text-[length:var(--font-size-base)] text-[var(--text-secondary)]">
          {en.listing.emptyDescription}
        </p>
      </div>
      
      <div className="flex gap-[var(--spacing-md)]">
        <Button
          variant="secondary"
          onClick={() => router.push('/')}
        >
          {en.listing.backToHome}
        </Button>
        <Button
          variant="default"
          onClick={() => router.push('/categories')}
        >
          {en.listing.browseCategories}
        </Button>
      </div>
    </div>
  );
}
