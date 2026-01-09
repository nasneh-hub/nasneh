import React from 'react';

/**
 * Auth Layout
 * 
 * Clean layout for authentication pages (login, verify).
 * NO Header/Footer - just the page content.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
      {children}
    </div>
  );
}
