'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Logo } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
import { useAuth } from '@/context/auth-context';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        <div className="text-[color:var(--text-secondary)]">{ar.ui.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Header */}
      <header className="bg-[var(--bg-primary)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo variant="full" size="md" />
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-[color:var(--text-secondary)]">
                {ar.ui.hi} {user?.name || user?.phone}
              </span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                {ar.auth.logout}
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={() => router.push('/login')}>
              {ar.auth.login}
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAuthenticated ? (
          <Card padding="lg">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4 text-[color:var(--text-primary)]">
                {ar.auth.welcome}
              </h1>
              <p className="text-[color:var(--text-secondary)] mb-6">
                {ar.taglines.primary}
              </p>
              <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 inline-block">
                <p className="text-sm text-[color:var(--text-secondary)]">
                  {ar.auth.phone}: <span className="font-medium text-[color:var(--text-primary)]" dir="ltr">{user?.phone}</span>
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card padding="lg">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4 text-[color:var(--text-primary)]">
                {ar.ui.welcome}
              </h1>
              <p className="text-[color:var(--text-secondary)] mb-6">
                {ar.taglines.secondary}
              </p>
              <Button variant="primary" size="lg" onClick={() => router.push('/login')}>
                {ar.cta.browseNasneh}
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
