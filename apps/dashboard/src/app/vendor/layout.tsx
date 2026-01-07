'use client';

import React from 'react';
import { RoleGuard, DashboardLayout } from '../../components';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['VENDOR']}>
      <DashboardLayout>{children}</DashboardLayout>
    </RoleGuard>
  );
}
