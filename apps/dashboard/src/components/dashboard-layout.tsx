'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button, Badge, Logo, Avatar } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
import { useAuth, Role } from '../context/auth-context';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const ROLE_NAV_ITEMS: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: ar.dashboard.home, href: '/admin', icon: '🏠' },
    { label: ar.dashboard.users, href: '/admin/users', icon: '👥' },
    { label: ar.dashboard.applications, href: '/admin/applications', icon: '📋' },
    { label: ar.dashboard.orders, href: '/admin/orders', icon: '📦' },
    { label: ar.dashboard.reports, href: '/admin/reports', icon: '📊' },
    { label: ar.dashboard.settings, href: '/admin/settings', icon: '⚙️' },
  ],
  VENDOR: [
    { label: ar.dashboard.home, href: '/vendor', icon: '🏠' },
    { label: ar.dashboard.products, href: '/vendor/products', icon: '📦' },
    { label: ar.dashboard.orders, href: '/vendor/orders', icon: '🛒' },
    { label: ar.dashboard.analytics, href: '/vendor/analytics', icon: '📊' },
    { label: ar.dashboard.settings, href: '/vendor/settings', icon: '⚙️' },
  ],
  PROVIDER: [
    { label: ar.dashboard.home, href: '/provider', icon: '🏠' },
    { label: ar.dashboard.services, href: '/provider/services', icon: '🔧' },
    { label: ar.dashboard.bookings, href: '/provider/bookings', icon: '📅' },
    { label: ar.dashboard.analytics, href: '/provider/analytics', icon: '📊' },
    { label: ar.dashboard.settings, href: '/provider/settings', icon: '⚙️' },
  ],
  DRIVER: [
    { label: ar.dashboard.home, href: '/driver', icon: '🏠' },
    { label: ar.dashboard.deliveries, href: '/driver/deliveries', icon: '🚗' },
    { label: ar.dashboard.analytics, href: '/driver/analytics', icon: '📊' },
    { label: ar.dashboard.settings, href: '/driver/settings', icon: '⚙️' },
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: ar.dashboard.roles.admin,
  VENDOR: ar.dashboard.roles.vendor,
  PROVIDER: ar.dashboard.roles.provider,
  DRIVER: ar.dashboard.roles.driver,
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, activeRole, logout, hasMultipleRoles, setActiveRole } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (!activeRole || !user) {
    return null;
  }

  const navItems = ROLE_NAV_ITEMS[activeRole];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSwitchRole = (role: Role) => {
    setActiveRole(role);
    setShowRoleSwitcher(false);
    router.push(`/${role.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Sidebar */}
      <aside className="fixed top-0 right-0 w-64 h-full bg-[var(--bg-primary)] shadow-lg z-40">
        {/* Logo */}
        <div className="p-4 border-b border-[var(--bg-tertiary)]">
          <Logo variant="auto" />
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <button
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-[var(--brand-primary)] text-[var(--text-inverse)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="mr-64">
        {/* Header */}
        <header className="sticky top-0 bg-[var(--bg-primary)] shadow-sm z-30">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Current Role Badge */}
            <div className="flex items-center gap-3">
              <Badge variant="default">
                {ROLE_LABELS[activeRole]}
              </Badge>
              {hasMultipleRoles() && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  >
                    {ar.dashboard.switchRole}
                  </Button>
                  
                  {showRoleSwitcher && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-primary)] rounded-xl shadow-lg py-2 z-50">
                      {user.roles
                        .filter((role) => role !== activeRole)
                        .map((role) => (
                          <button
                            key={role}
                            onClick={() => handleSwitchRole(role)}
                            className="w-full px-4 py-2 text-right text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                          >
                            {ROLE_LABELS[role]}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3"
              >
                <Avatar
                  name={user.name || user.phone}
                  size="sm"
                />
                <span className="text-sm text-[var(--text-primary)]">
                  {user.name || user.phone}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--bg-primary)] rounded-xl shadow-lg py-2 z-50">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push(`/${activeRole.toLowerCase()}/settings`);
                    }}
                    className="w-full px-4 py-2 text-right text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                  >
                    {ar.dashboard.profile}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-right text-[var(--text-error)] hover:bg-[var(--bg-tertiary)]"
                  >
                    {ar.auth.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Click outside to close menus */}
      {(showRoleSwitcher || showUserMenu) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => {
            setShowRoleSwitcher(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </div>
  );
}
