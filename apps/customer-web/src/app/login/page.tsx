'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardContent, Logo } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
import { requestOtp } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Validate Bahrain phone number
  const validatePhone = (value: string): boolean => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    // Bahrain numbers: 8 digits starting with 3
    return /^3\d{7}$/.test(digits);
  };

  const formatPhoneForApi = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    return `+973${digits}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    const digits = value.replace(/\D/g, '');
    // Limit to 8 digits
    setPhone(digits.slice(0, 8));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone) {
      setError(ar.errors.requiredField);
      return;
    }

    if (!validatePhone(phone)) {
      setError(ar.errors.invalidPhone);
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedPhone = formatPhoneForApi(phone);
      const response = await requestOtp(formattedPhone);

      if (response.success) {
        // Store phone in sessionStorage for verify page
        sessionStorage.setItem('otp_phone', formattedPhone);
        sessionStorage.setItem('otp_expires_in', String(response.data?.expiresIn || 300));
        router.push('/verify');
      } else {
        setError(response.error || ar.errors.somethingWrong);
      }
    } catch {
      setError(ar.errors.networkError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        <div className="text-[color:var(--text-secondary)]">{ar.ui.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo variant="full" size="lg" />
        </div>

        {/* Login Card */}
        <Card>
          <CardContent className="p-6">
            <h1 className="text-xl font-semibold text-center mb-2 text-[color:var(--text-primary)]">
              {ar.auth.login}
            </h1>
            <p className="text-sm text-center mb-6 text-[color:var(--text-secondary)]">
              {ar.auth.welcome}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Input */}
              <div>
                <label 
                  htmlFor="phone" 
                  className="block text-sm font-medium mb-2 text-[color:var(--text-primary)]"
                >
                  {ar.auth.phoneNumber}
                </label>
                <div className="flex gap-2">
                  {/* Country Code */}
                  <div className="flex items-center justify-center px-4 h-12 bg-[var(--bg-tertiary)] rounded-xl text-[color:var(--text-secondary)] text-sm shrink-0">
                    +973
                  </div>
                  {/* Phone Input */}
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder={ar.auth.phonePlaceholder}
                    error={!!error}
                    disabled={isSubmitting}
                    autoComplete="tel"
                    className="flex-1"
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-[color:var(--color-danger)]">
                    {error}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || !phone}
                className="w-full"
              >
                {isSubmitting ? ar.ui.loading : ar.auth.sendOtp}
              </Button>
            </form>

            {/* Terms */}
            <p className="mt-6 text-xs text-center text-[color:var(--text-tertiary)]">
              {ar.auth.byLoggingIn}{' '}
              <a href="/terms" className="underline hover:text-[color:var(--text-secondary)]">
                {ar.auth.termsOfService}
              </a>{' '}
              {ar.auth.and}{' '}
              <a href="/privacy" className="underline hover:text-[color:var(--text-secondary)]">
                {ar.auth.privacyPolicy}
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
