'use client';

import React from 'react';
import { RoleGuard, DashboardLayout } from '../../components';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
