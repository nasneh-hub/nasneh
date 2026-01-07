import React from 'react';
import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/auth-context';
import { ar } from '@nasneh/ui/copy';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
});

export const metadata: Metadata = {
  title: ar.dashboard.loginTitle,
  description: ar.dashboard.loginSubtitle,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={vazirmatn.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
