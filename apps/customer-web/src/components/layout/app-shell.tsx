'use client';

import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell Component
 * 
 * Simple container for page content.
 * Header is rendered in (app) layout, not here.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="max-w-screen-xl mx-auto px-6">
      {children}
    </div>
  );
}
