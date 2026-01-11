'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Logo, Select, type SelectOption } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { requestOtp } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import BH from 'country-flag-icons/react/3x2/BH';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+973');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Country code options - FROM COPY TOKENS (single source)
  const countryOptions: SelectOption[] = [
    {
      value: '+973',
      label: `🇧🇭 ${en.auth.bahrainCode}`, // Flag emoji + code from copy tokens
      disabled: false,
    },
    {
      value: 'gcc',
      label: en.auth.gccSoon, // "GCC (Soon)" from copy tokens
      disabled: true,
    },
  ];

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
    return `${countryCode}${digits}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    const digits = value.replace(/\D/g, '');
    // Limit to 8 digits
    setPhone(digits.slice(0, 8));
    setError('');
  };

  const handleCountryCodeChange = (value: string | string[]) => {
    if (typeof value === 'string' && value !== 'gcc') {
      setCountryCode(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone) {
      setError(en.errors.requiredField);
      return;
    }

    if (!validatePhone(phone)) {
      setError(en.errors.invalidPhone);
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
        setError(response.error || en.errors.somethingWrong);
      }
    } catch {
      setError(en.errors.networkError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        <div className="text-[color:var(--text-secondary)]">{en.ui.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo variant="auto" size={40} />
        </div>

        {/* Login Card - FROM @nasneh/ui (shadcn-based) */}
        <Card padding="lg">
          <h1 className="text-xl font-semibold text-center mb-2 text-[color:var(--text-primary)]">
            {en.auth.login}
          </h1>
          <p className="text-sm text-center mb-6 text-[color:var(--text-secondary)]">
            {en.auth.welcome}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Input */}
            <div>
              <label 
                htmlFor="phone" 
                className="block text-sm font-medium mb-2 text-[color:var(--text-primary)]"
              >
                {en.auth.phoneNumber}
              </label>
              <div className="flex gap-2">
                {/* Country Code Switcher - FROM @nasneh/ui (shadcn-based) */}
                <div className="w-32 shrink-0">
                  <Select
                    options={countryOptions}
                    value={countryCode}
                    onChange={handleCountryCodeChange}
                    disabled={isSubmitting}
                    size="lg"
                  />
                </div>
                
                {/* Phone Input - FROM @nasneh/ui (shadcn-based) */}
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder={en.auth.phonePlaceholder}
                  error={error || undefined}
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

            {/* Submit Button - FROM @nasneh/ui (shadcn-based) */}
            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={isSubmitting || !phone}
              className="w-full"
            >
              {isSubmitting ? en.ui.loading : en.auth.sendOtp}
            </Button>
          </form>

          {/* Staging Debug Info */}
          {process.env.NEXT_PUBLIC_APP_ENV === 'staging' && (
            <div className="mt-4 p-3 bg-[color:var(--bg-tertiary)] rounded-xl text-xs text-[color:var(--text-secondary)]">
              <div className="font-medium mb-1">Debug Info (Staging Only):</div>
              <div>API Base: {process.env.NEXT_PUBLIC_API_URL}</div>
              <div>Auth Endpoint: {process.env.NEXT_PUBLIC_API_URL}/auth/request-otp</div>
            </div>
          )}

          {/* Go Back Button - FROM @nasneh/ui (shadcn-based) */}
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => router.push('/')}
            className="w-full mt-3"
          >
            {en.auth.goBack}
          </Button>

          {/* Terms */}
          <p className="mt-6 text-xs text-center text-[color:var(--text-tertiary)]">
            {en.auth.byLoggingIn}{' '}
            <a href="/terms" className="underline hover:text-[color:var(--text-secondary)]">
              {en.auth.termsOfService}
            </a>{' '}
            {en.auth.and}{' '}
            <a href="/privacy" className="underline hover:text-[color:var(--text-secondary)]">
              {en.auth.privacyPolicy}
            </a>
          </p>
        </Card>
      </div>
    </div>
  );
}
