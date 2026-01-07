'use client';

import React from 'react';
import { Card } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';

export default function DriverDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
        {ar.dashboard.dashboard} - {ar.dashboard.roles.driver}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card padding="lg">
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--text-primary)]">0</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{ar.dashboard.deliveries}</p>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--text-primary)]">0</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{ar.ui.pending}</p>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--text-primary)]">0.0</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{ar.dashboard.rating}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
