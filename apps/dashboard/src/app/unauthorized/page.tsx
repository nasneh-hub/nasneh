'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Logo } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
import { useAuth } from '../../context/auth-context';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { activeRole } = useAuth();

  const handleGoBack = () => {
    if (activeRole) {
      router.push(`/${activeRole.toLowerCase()}`);
    } else {
      router.push('/select-role');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-secondary)] p-4">
      <Card padding="lg" className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Logo variant="auto" />
        </div>
        
        <div className="text-6xl mb-4">🚫</div>
        
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {ar.dashboard.unauthorized}
        </h1>
        
        <p className="text-[var(--text-secondary)] mb-6">
          {ar.dashboard.unauthorizedMessage}
        </p>

        <Button variant="default" onClick={handleGoBack}>
          {ar.dashboard.goBack}
        </Button>
      </Card>
    </div>
  );
}
