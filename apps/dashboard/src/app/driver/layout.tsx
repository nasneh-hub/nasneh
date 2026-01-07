'use client';

import React from 'react';
import { RoleGuard, DashboardLayout } from '../../components';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['DRIVER']}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
