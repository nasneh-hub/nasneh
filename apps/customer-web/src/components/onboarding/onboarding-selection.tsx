'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { getApiUrl } from '../../lib/api';

interface ApplicationStatus {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export function OnboardingSelection() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVendorApplication, setHasVendorApplication] = useState(false);
  const [hasProviderApplication, setHasProviderApplication] = useState(false);

  useEffect(() => {
    checkExistingApplications();
  }, []);

  async function checkExistingApplications() {
    try {
      setLoading(true);
      setError(null);

      // Check vendor application
      const vendorResponse = await fetch(
        getApiUrl('/vendor-applications/me'),
        {
          credentials: 'include',
        }
      );

      if (vendorResponse.ok) {
        const vendorData = await vendorResponse.json();
        if (vendorData.success && vendorData.data) {
          setHasVendorApplication(true);
          // Redirect to status page if application exists
          router.push('/onboarding/status');
          return;
        }
      }

      // Check provider application
      const providerResponse = await fetch(
        getApiUrl('/provider-applications/me'),
        {
          credentials: 'include',
        }
      );

      if (providerResponse.ok) {
        const providerData = await providerResponse.json();
        if (providerData.success && providerData.data) {
          setHasProviderApplication(true);
          // Redirect to status page if application exists
          router.push('/onboarding/status');
          return;
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to check applications:', err);
      setError(en.onboarding.loadingError);
      setLoading(false);
    }
  }

  function handleVendorClick() {
    router.push('/onboarding/vendor');
  }

  function handleProviderClick() {
    router.push('/onboarding/provider');
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-text-primary)]"
            role="status"
            aria-label={en.onboarding.checkingStatus}
          />
          <p className="text-[var(--color-text-secondary)]">
            {en.onboarding.checkingStatus}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-[var(--color-text-primary)]">{error}</p>
          <button
            onClick={checkExistingApplications}
            className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-[var(--color-text-on-primary)] transition-opacity hover:opacity-90"
          >
            {en.onboarding.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-[var(--color-text-primary)]">
          {en.onboarding.selectionTitle}
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          {en.onboarding.selectionSubtitle}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Vendor Card */}
        <Card className="flex flex-col p-6">
          <div className="mb-4">
            <h2 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
              {en.onboarding.becomeVendor}
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              {en.onboarding.becomeVendorDesc}
            </p>
          </div>
          <button
            onClick={handleVendorClick}
            className="mt-auto rounded-xl bg-[var(--color-primary)] px-6 py-3 text-[var(--color-text-on-primary)] transition-opacity hover:opacity-90"
          >
            {en.onboarding.startApplication}
          </button>
        </Card>

        {/* Provider Card */}
        <Card className="flex flex-col p-6">
          <div className="mb-4">
            <h2 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
              {en.onboarding.becomeProvider}
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              {en.onboarding.becomeProviderDesc}
            </p>
          </div>
          <button
            onClick={handleProviderClick}
            className="mt-auto rounded-xl bg-[var(--color-primary)] px-6 py-3 text-[var(--color-text-on-primary)] transition-opacity hover:opacity-90"
          >
            {en.onboarding.startApplication}
          </button>
        </Card>
      </div>
    </div>
  );
}
