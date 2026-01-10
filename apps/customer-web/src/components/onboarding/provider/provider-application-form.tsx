'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Select, Textarea } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { getApiUrl } from '@/lib/api';

type ProviderCategory = 'HOME' | 'PERSONAL' | 'PROFESSIONAL';

interface FormData {
  businessName: string;
  category: ProviderCategory | '';
  crNumber: string;
  qualifications: string;
  document: File | null;
  description: string;
}

export function ProviderApplicationForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    category: '',
    crNumber: '',
    qualifications: '',
    document: null,
    description: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.businessName || formData.businessName.length < 2) {
      newErrors.businessName = en.onboarding.provider.errors.businessNameRequired;
    }

    if (!formData.category) {
      newErrors.category = en.onboarding.provider.errors.categoryRequired;
    }

    // CR number is required for all providers
    if (!formData.crNumber) {
      newErrors.crNumber = en.onboarding.provider.errors.crNumberRequired;
    }

    // Document is required (but currently disabled)
    if (!formData.document) {
      newErrors.document = en.onboarding.provider.errors.documentRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      setError('');
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Store CR number in description with [CR=number] prefix
      const descriptionWithCR = formData.crNumber 
        ? `[CR=${formData.crNumber}] ${formData.description}`.trim()
        : formData.description;

      const response = await fetch(getApiUrl('/provider-applications'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          businessName: formData.businessName,
          category: formData.category,
          qualifications: formData.qualifications || undefined,
          description: descriptionWithCR || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || en.errors.somethingWrong);
      }

      // Success - redirect to status page
      router.push('/onboarding/status');
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError(en.errors.networkError);
      } else {
        setError(err instanceof Error ? err.message : en.errors.somethingWrong);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          {step === 1 ? en.onboarding.provider.step1Title : en.onboarding.provider.step2Title}
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          {step === 1 ? en.onboarding.provider.step1Description : en.onboarding.provider.step2Description}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-[var(--destructive)] bg-opacity-10 p-4">
          <p className="text-sm text-[var(--destructive)]">{error}</p>
        </div>
      )}

      {/* Step 1: Business & Qualifications */}
      {step === 1 && (
        <Card padding="lg">
          <div className="space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {en.onboarding.provider.businessName}
                <span className="text-[var(--destructive)]"> *</span>
              </label>
              <Input
                value={formData.businessName}
                onChange={(e) => {
                  setFormData({ ...formData, businessName: e.target.value });
                  if (errors.businessName) {
                    setErrors({ ...errors, businessName: undefined });
                  }
                }}
                placeholder={en.onboarding.provider.businessNamePlaceholder}
              />
              {errors.businessName && (
                <p className="text-sm text-[var(--destructive)]">{errors.businessName}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {en.onboarding.provider.category}
                <span className="text-[var(--destructive)]"> *</span>
              </label>
              <Select
                value={formData.category}
                onChange={(value) => {
                  setFormData({ ...formData, category: value as ProviderCategory });
                  if (errors.category) {
                    setErrors({ ...errors, category: undefined });
                  }
                }}
                placeholder={en.onboarding.provider.categoryPlaceholder}
                options={[
                  { value: 'HOME', label: en.onboarding.provider.categories.home },
                  { value: 'PERSONAL', label: en.onboarding.provider.categories.personal },
                  { value: 'PROFESSIONAL', label: en.onboarding.provider.categories.professional },
                ]}
              />
              {errors.category && (
                <p className="text-sm text-[var(--destructive)]">{errors.category}</p>
              )}
            </div>

            {/* CR Number (always required) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {en.onboarding.provider.crNumber}
                <span className="text-[var(--destructive)]"> *</span>
              </label>
              <Input
                value={formData.crNumber}
                onChange={(e) => {
                  setFormData({ ...formData, crNumber: e.target.value });
                  if (errors.crNumber) {
                    setErrors({ ...errors, crNumber: undefined });
                  }
                }}
                placeholder={en.onboarding.provider.crNumberPlaceholder}
              />
              {errors.crNumber && (
                <p className="text-sm text-[var(--destructive)]">{errors.crNumber}</p>
              )}
            </div>

            {/* Qualifications */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {en.onboarding.provider.qualifications}
              </label>
              <Textarea
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                placeholder={en.onboarding.provider.qualificationsPlaceholder}
                maxLength={500}
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                {formData.qualifications.length}/500
              </p>
            </div>

            {/* Document Upload (required, disabled) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {en.onboarding.provider.documentLabel}
                <span className="text-[var(--destructive)]"> *</span>
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData({ ...formData, document: file });
                    if (errors.document) {
                      setErrors({ ...errors, document: undefined });
                    }
                  }}
                  disabled
                  className="w-full rounded-xl bg-[var(--input-bg)] px-4 py-2 text-sm text-[var(--foreground)] file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--muted)] file:px-4 file:py-2 file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="rounded-xl bg-[var(--warning)] bg-opacity-10 p-3">
                  <p className="text-sm text-[var(--warning)]">
                    {en.onboarding.provider.documentComingSoon}
                  </p>
                </div>
              </div>
              {errors.document && (
                <p className="text-sm text-[var(--destructive)]">{errors.document}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {en.onboarding.provider.description}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={en.onboarding.provider.descriptionPlaceholder}
                maxLength={500}
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                {formData.description.length}/500
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <Button onClick={handleNext}>
              {en.onboarding.provider.next}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Review & Submit */}
      {step === 2 && (
        <Card padding="lg">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {en.onboarding.provider.businessName}
              </p>
              <p className="mt-1 font-medium">{formData.businessName}</p>
            </div>

            <div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {en.onboarding.provider.category}
              </p>
              <p className="mt-1 font-medium">
                {formData.category === 'HOME' && en.onboarding.provider.categories.home}
                {formData.category === 'PERSONAL' && en.onboarding.provider.categories.personal}
                {formData.category === 'PROFESSIONAL' && en.onboarding.provider.categories.professional}
              </p>
            </div>

            <div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {en.onboarding.provider.crNumber}
              </p>
              <p className="mt-1 font-medium">{formData.crNumber}</p>
            </div>

            {formData.qualifications && (
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {en.onboarding.provider.qualifications}
                </p>
                <p className="mt-1">{formData.qualifications}</p>
              </div>
            )}

            {formData.description && (
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {en.onboarding.provider.description}
                </p>
                <p className="mt-1">{formData.description}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-between">
            <Button variant="secondary" onClick={handleBack} disabled={loading}>
              {en.onboarding.provider.back}
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? en.onboarding.provider.submitting : en.onboarding.provider.submit}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
