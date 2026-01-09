import React from 'react';
import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-family-primary',
});

// Note: Metadata uses hardcoded strings because Next.js metadata must be static
// These values match ar.ui.nasneh and ar.taglines.primary/secondary
export const metadata: Metadata = {
  title: 'Nasneh',
  description: 'From us, for us - Our marketplace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={vazirmatn.variable}>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[color:var(--text-primary)]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
