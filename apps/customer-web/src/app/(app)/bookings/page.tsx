'use client';

import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Calendar } from 'lucide-react';

export default function BookingsPage() {
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
        <Calendar size={64} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-lg)' }} />
        <h1
          style={{
            fontSize: 'var(--font-size-h1)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          My Bookings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-large)' }}>
          Your service bookings will appear here
        </p>
      </div>
    </AppShell>
  );
}
