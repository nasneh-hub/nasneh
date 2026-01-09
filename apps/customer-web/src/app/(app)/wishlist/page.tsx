'use client';

import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  return (
    <AppShell>
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Heart size={64} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-lg)' }} />
        <h1
          style={{
            fontSize: 'var(--font-size-h1)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          Wishlist
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-large)' }}>
          Your favorite items will appear here
        </p>
      </div>
    </AppShell>
  );
}
