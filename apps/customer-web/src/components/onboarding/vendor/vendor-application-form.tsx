'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Select, Textarea, RadioGroup, RadioGroupItem } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { getApiUrl } from '@/lib/api';

type VendorCategory = 'HOME_KITCHEN' | 'CRAFTS' | 'MARKET' | 'FOOD_TRUCK';
type EligibilityType = 'SIJILI' | 'KHOTWA' | 'CR';

interface FormData {
  businessName: string;
  category: VendorCategory | '';
  eligibilityType: EligibilityType | '';
  crNumber: string;
  description: string;
}

export function VendorApplicationForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    category: '',
    eligibilityType: '',
    crNumber: '',
    description: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.businessName || formData.businessName.length < 2) {
      newErrors.businessName = en.onboarding.vendor.errors.businessNameRequired;
    }

    if (!formData.category) {
      newErrors.category = en.onboarding.vendor.errors.categoryRequired;
    }

    if (!formData.eligibilityType) {
      newErrors.eligibilityType = en.onboarding.vendor.errors.eligibilityRequired;
    }

    if (formData.eligibilityType === 'CR' && !formData.crNumber) {
      newErrors.crNumber = en.onboarding.vendor.errors.crNumberRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
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
      // Build description with eligibility prefix
      const eligibilityPrefix = `[ELIGIBILITY=${formData.eligibilityType}]`;
      const fullDescription = formData.description
        ? `${eligibilityPrefix} ${formData.description}`
        : eligibilityPrefix;

      const response = await fetch(getApiUrl('/vendor-applications'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          category: formData.category,
          crNumber: formData.crNumber || undefined,
          description: fullDescription,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required. Please log in.');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || en.onboarding.vendor.errors.submitFailed);
        return;
      }

      // Success - redirect to status page
      router.push('/onboarding/status');
    } catch (err) {
      setError(en.errors.networkError);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      HOME_KITCHEN: en.onboarding.vendor.categories.homeKitchen,
      CRAFTS: en.onboarding.vendor.categories.crafts,
      MARKET: en.onboarding.vendor.categories.market,
      FOOD_TRUCK: en.onboarding.vendor.categories.foodTruck,
    };
    return labels[category] || category;
  };

  const getEligibilityLabel = (type: string): string => {
    const labels: Record<string, string> = {
      SIJILI: en.onboarding.vendor.eligibility.sijili,
      KHOTWA: en.onboarding.vendor.eligibility.khotwa,
      CR: en.onboarding.vendor.eligibility.cr,
    };
    return labels[type] || type;
  };

  if (step === 1) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{en.onboarding.vendor.step1Title}</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            {en.onboarding.vendor.step1Description}
          </p>
        </div>

        <Card padding="lg">
          <div className="space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {en.onboarding.vendor.businessName}
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
                placeholder={en.onboarding.vendor.businessNamePlaceholder}
              />
              {errors.businessName && (
                <p className="text-sm text-[var(--destructive)]">{errors.businessName}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {en.onboarding.vendor.category}
                <span className="text-[var(--destructive)]"> *</span>
              </label>
              <Select
                options={[
                  { label: en.onboarding.vendor.categoryPlaceholder, value: '' },
                  { label: en.onboarding.vendor.categories.homeKitchen, value: 'HOME_KITCHEN' },
                  { label: en.onboarding.vendor.categories.crafts, value: 'CRAFTS' },
                  { label: en.onboarding.vendor.categories.market, value: 'MARKET' },
                  { label: en.onboarding.vendor.categories.foodTruck, value: 'FOOD_TRUCK' },
                ]}
                value={formData.category}
                onChange={(value) => {
                  setFormData({ ...formData, category: value as VendorCategory });
                  if (errors.category) {
                    setErrors({ ...errors, category: undefined });
                  }
                }}
                placeholder={en.onboarding.vendor.categoryPlaceholder}
              />
              {errors.category && (
                <p className="text-sm text-[var(--destructive)]">{errors.category}</p>
              )}
            </div>

            {/* Eligibility Type */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                {en.onboarding.vendor.eligibilityType}
                <span className="text-[var(--destructive)]"> *</span>
              </label>
              <RadioGroup
                value={formData.eligibilityType}
                onValueChange={(value) => {
                  setFormData({ ...formData, eligibilityType: value as EligibilityType, crNumber: '' });
                  if (errors.eligibilityType) {
                    setErrors({ ...errors, eligibilityType: undefined });
                  }
                }}
              >
                <div className="flex items-center space-x-3 rounded-xl border border-[var(--border)] p-4">
                  <RadioGroupItem value="SIJILI" id="sijili" />
                  <label htmlFor="sijili" className="flex-1 cursor-pointer text-sm">
                    {en.onboarding.vendor.eligibility.sijili}
                  </label>
                </div>
                <div className="flex items-center space-x-3 rounded-xl border border-[var(--border)] p-4">
                  <RadioGroupItem value="KHOTWA" id="khotwa" />
                  <label htmlFor="khotwa" className="flex-1 cursor-pointer text-sm">
                    {en.onboarding.vendor.eligibility.khotwa}
                  </label>
                </div>
                <div className="flex items-center space-x-3 rounded-xl border border-[var(--border)] p-4">
                  <RadioGroupItem value="CR" id="cr" />
                  <label htmlFor="cr" className="flex-1 cursor-pointer text-sm">
                    {en.onboarding.vendor.eligibility.cr}
                  </label>
                </div>
              </RadioGroup>
              {errors.eligibilityType && (
                <p className="text-sm text-[var(--destructive)]">{errors.eligibilityType}</p>
              )}
            </div>

            {/* CR Number (conditional) */}
            {formData.eligibilityType === 'CR' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {en.onboarding.vendor.crNumber}
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
                  placeholder={en.onboarding.vendor.crNumberPlaceholder}
                />
                {errors.crNumber && (
                  <p className="text-sm text-[var(--destructive)]">{errors.crNumber}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {en.onboarding.vendor.description}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={en.onboarding.vendor.descriptionPlaceholder}
                maxLength={500}
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                {formData.description.length}/500
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleNext}>
            {en.onboarding.vendor.next}
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: Review & Submit
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{en.onboarding.vendor.step2Title}</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          {en.onboarding.vendor.step2Description}
        </p>
      </div>

      <Card padding="lg">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {en.onboarding.vendor.businessName}
            </p>
            <p className="mt-1 font-medium">{formData.businessName}</p>
          </div>

          <div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {en.onboarding.vendor.category}
            </p>
            <p className="mt-1 font-medium">{getCategoryLabel(formData.category)}</p>
          </div>

          <div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {en.onboarding.vendor.eligibilityType}
            </p>
            <p className="mt-1 font-medium">{getEligibilityLabel(formData.eligibilityType)}</p>
          </div>

          {formData.crNumber && (
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {en.onboarding.vendor.crNumber}
              </p>
              <p className="mt-1 font-medium">{formData.crNumber}</p>
            </div>
          )}

          {formData.description && (
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {en.onboarding.vendor.description}
              </p>
              <p className="mt-1">{formData.description}</p>
            </div>
          )}
        </div>
      </Card>

      {error && (
        <div className="rounded-xl bg-[var(--destructive)] bg-opacity-10 p-4">
          <p className="text-sm text-[var(--destructive)]">{error}</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={handleBack} disabled={loading}>
          {en.ui.back}
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? en.ui.loading : en.onboarding.vendor.submit}
        </Button>
      </div>
    </div>
  );
}
