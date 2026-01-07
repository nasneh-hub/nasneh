'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth-context';
import { ar } from '@nasneh/ui/copy';

export default function HomePage() {
  const router = useRouter();
  const { user, activeRole, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (activeRole) {
      router.push(`/${activeRole.toLowerCase()}`);
      return;
    }

    if (user.roles.length > 1) {
      router.push('/select-role');
    } else if (user.roles.length === 1) {
      router.push(`/${user.roles[0].toLowerCase()}`);
    }
  }, [user, activeRole, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
      <div className="text-[var(--text-secondary)]">{ar.ui.loading}</div>
    </div>
  );
}
