'use client';

import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Star } from 'lucide-react';

export default function ReviewsPage() {
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
        <Star size={64} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-lg)' }} />
        <h1
          style={{
            fontSize: 'var(--font-size-h1)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          My Reviews
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-large)' }}>
          Your reviews and ratings will appear here
        </p>
      </div>
    </AppShell>
  );
}
