'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, Role } from '../context/auth-context';
import { ar } from '@nasneh/ui/copy';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const { user, activeRole, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Not logged in
    if (!user) {
      router.push('/login');
      return;
    }

    // No active role selected
    if (!activeRole) {
      if (user.roles.length > 1) {
        router.push('/select-role');
      } else if (user.roles.length === 1) {
        // Auto-select single role
        router.push(`/${user.roles[0].toLowerCase()}`);
      }
      return;
    }

    // Check if user has required role
    const hasAllowedRole = allowedRoles.some((role) => hasRole(role));
    if (!hasAllowedRole) {
      router.push('/unauthorized');
    }
  }, [user, activeRole, isLoading, allowedRoles, hasRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        <div className="text-[var(--text-secondary)]">{ar.ui.loading}</div>
      </div>
    );
  }

  // Check access
  if (!user || !activeRole) {
    return null;
  }

  const hasAllowedRole = allowedRoles.some((role) => hasRole(role));
  if (!hasAllowedRole) {
    return null;
  }

  return <>{children}</>;
}
