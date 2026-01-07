'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Logo } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
import { useAuth } from '../../context/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { user, activeRole, isLoading, login } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      if (activeRole) {
        router.push(`/${activeRole.toLowerCase()}`);
      } else if (user.roles.length > 1) {
        router.push('/select-role');
      } else if (user.roles.length === 1) {
        router.push(`/${user.roles[0].toLowerCase()}`);
      }
    }
  }, [user, activeRole, isLoading, router]);

  const validatePhone = (value: string): boolean => {
    // Bahrain phone: 8 digits starting with 3
    const phoneRegex = /^3\d{7}$/;
    return phoneRegex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePhone(phone)) {
      setError(ar.errors.invalidPhone);
      return;
    }

    setIsSubmitting(true);

    const fullPhone = `+973${phone}`;
    const result = await login(fullPhone);

    if (result.success) {
      // Store phone for verify page
      sessionStorage.setItem('verify_phone', fullPhone);
      router.push('/verify');
    } else {
      setError(result.error || ar.errors.somethingWrong);
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        <div className="text-[var(--text-secondary)]">{ar.ui.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-secondary)] p-4">
      {/* Back to website link */}
      <a
        href="https://nasneh.com"
        className="absolute top-4 right-4 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        {ar.dashboard.backToWebsite} &larr;
      </a>

      <Card padding="lg">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo variant="auto" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              {ar.dashboard.loginTitle}
            </h1>
            <p className="text-[var(--text-secondary)]">
              {ar.dashboard.loginSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {ar.auth.phoneNumber}
              </label>
              <div className="flex gap-2" dir="ltr">
                <div className="flex items-center justify-center px-3 bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-secondary)] text-sm">
                  +973
                </div>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setPhone(value);
                    setError('');
                  }}
                  placeholder="3XXXXXXX"
                  error={error}
                  dir="ltr"
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-[var(--text-error)]">{error}</p>
              )}
            </div>

            <div className="w-full">
              <Button
                type="submit"
                variant="default"
                size="lg"
                disabled={isSubmitting || phone.length !== 8}
              >
                {isSubmitting ? ar.ui.loading : ar.auth.sendOtp}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-sm text-[var(--text-tertiary)]">
        {ar.ui.nasneh} &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
