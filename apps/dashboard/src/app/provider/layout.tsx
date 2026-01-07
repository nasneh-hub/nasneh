'use client';

import React from 'react';
import { RoleGuard, DashboardLayout } from '../../components';

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['PROVIDER']}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
