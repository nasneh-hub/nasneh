import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

/**
 * App Layout
 * 
 * Main application layout with Header and Footer.
 * Used for all authenticated/public app pages (home, profile, categories, etc.)
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 'var(--spacing-lg)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
