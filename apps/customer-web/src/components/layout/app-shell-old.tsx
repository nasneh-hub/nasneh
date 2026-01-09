'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Logo, Button } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
import { useAuth } from '@/context/auth-context';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navigation = [
    { name: ar.dashboard.home, href: '/', icon: '🏠' },
    { name: 'التصنيفات', href: '/categories', icon: '📦' },
    { name: ar.dashboard.profile, href: '/profile', icon: '👤' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--bg-primary)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            height: '4rem',
            alignItems: 'center',
            gap: 'var(--spacing-lg)',
            padding: '0 var(--spacing-lg)',
          }}
        >
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'block',
              padding: 'var(--spacing-sm)',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Toggle menu"
            className="lg:hidden rounded-xl"
          >
            <svg
              style={{ width: '1.5rem', height: '1.5rem', color: 'var(--text-primary)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <div style={{ flexShrink: 0 }}>
            <Logo variant="auto" size="md" />
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* User menu */}
          {isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <span
                style={{
                  fontSize: 'var(--font-size-small)',
                  color: 'var(--text-secondary)',
                }}
                dir="ltr"
                className="hidden sm:inline-block"
              >
                {user?.phone}
              </span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                {ar.auth.logout}
              </Button>
            </div>
          )}
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside
          style={{
            position: 'fixed',
            top: '4rem',
            right: 0,
            bottom: 0,
            width: '16rem',
            background: 'var(--bg-primary)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 40,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.2s ease-in-out',
          }}
          className="lg:relative lg:top-0 lg:translate-x-0 lg:shadow-none"
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', padding: 'var(--spacing-lg)' }}>
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="rounded-xl"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    background: active ? 'var(--bg-tertiary)' : 'transparent',
                    fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                  <span>{item.name}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 30,
              background: 'rgba(0, 0, 0, 0.5)',
            }}
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main
          style={{
            flex: 1,
            padding: 'var(--spacing-lg)',
          }}
          className="lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
