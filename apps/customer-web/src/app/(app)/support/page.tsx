'use client';

import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Headphones } from 'lucide-react';

export default function SupportPage() {
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
        <Headphones size={64} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-lg)' }} />
        <h1
          style={{
            fontSize: 'var(--font-size-h1)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          Support
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-large)' }}>
          Get help with your orders and account
        </p>
      </div>
    </AppShell>
  );
}
