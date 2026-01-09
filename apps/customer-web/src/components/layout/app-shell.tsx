'use client';

import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell Component
 * 
 * Simple container for page content.
 * Header is rendered in root layout, not here.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 var(--spacing-lg)',
      }}
    >
      {children}
    </div>
  );
}
