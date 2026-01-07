'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Logo } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
import { useAuth, Role } from '../../context/auth-context';

const ROLE_CONFIG: Record<Role, { icon: string; bgClass: string }> = {
  ADMIN: { icon: '🛡️', bgClass: 'bg-[var(--brand-primary)]/20' },
  VENDOR: { icon: '🏪', bgClass: 'bg-[var(--status-success)]/20' },
  PROVIDER: { icon: '🔧', bgClass: 'bg-[var(--status-info)]/20' },
  DRIVER: { icon: '🚗', bgClass: 'bg-[var(--status-warning)]/20' },
};

export default function SelectRolePage() {
  const router = useRouter();
  const { user, activeRole, isLoading, setActiveRole, hasMultipleRoles } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Redirect if already has active role
  useEffect(() => {
    if (!isLoading && user && activeRole) {
      router.push(`/${activeRole.toLowerCase()}`);
    }
  }, [user, activeRole, isLoading, router]);

  // Redirect if single role
  useEffect(() => {
    if (!isLoading && user && !hasMultipleRoles() && user.roles.length === 1) {
      setActiveRole(user.roles[0]);
      router.push(`/${user.roles[0].toLowerCase()}`);
    }
  }, [user, isLoading, hasMultipleRoles, setActiveRole, router]);

  const handleSelectRole = (role: Role) => {
    setActiveRole(role);
    router.push(`/${role.toLowerCase()}`);
  };

  const getRoleLabel = (role: Role): string => {
    const labels: Record<Role, string> = {
      ADMIN: ar.dashboard.roles.admin,
      VENDOR: ar.dashboard.roles.vendor,
      PROVIDER: ar.dashboard.roles.provider,
      DRIVER: ar.dashboard.roles.driver,
    };
    return labels[role];
  };

  const getRoleDescription = (role: Role): string => {
    const descriptions: Record<Role, string> = {
      ADMIN: ar.dashboard.roles.adminDesc,
      VENDOR: ar.dashboard.roles.vendorDesc,
      PROVIDER: ar.dashboard.roles.providerDesc,
      DRIVER: ar.dashboard.roles.driverDesc,
    };
    return descriptions[role];
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        <div className="text-[var(--text-secondary)]">{ar.ui.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-secondary)] p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo variant="auto" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {ar.dashboard.selectRole}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {ar.dashboard.selectRoleSubtitle}
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user.roles.map((role) => (
            <button
              key={role}
              onClick={() => handleSelectRole(role)}
              className="text-right"
            >
              <Card padding="lg">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${ROLE_CONFIG[role].bgClass}`}
                  >
                    {ROLE_CONFIG[role].icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                      {getRoleLabel(role)}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {getRoleDescription(role)}
                    </p>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>

        {/* User info */}
        <div className="text-center mt-8">
          <p className="text-sm text-[var(--text-tertiary)]">
            {user.name || user.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
