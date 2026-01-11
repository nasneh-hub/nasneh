'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, Input, Select } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
import { useAuth, getAccessToken } from '@/context/auth-context';
import { authenticatedFetch, getApiUrl } from '@/lib/api';

interface AddressForm {
  label: string;
  governorate: string;
  area: string;
  block: string;
  road: string;
  building: string;
  floor: string;
  apartment: string;
  notes: string;
  isDefault: boolean;
}

const GOVERNORATES = [
  { value: 'capital', label: ar.profile.capitalGovernorate },
  { value: 'muharraq', label: ar.profile.muharraqGovernorate },
  { value: 'northern', label: ar.profile.northernGovernorate },
  { value: 'southern', label: ar.profile.southernGovernorate },
];

const LABELS = [
  { value: 'home', label: ar.profile.labelHome },
  { value: 'work', label: ar.profile.labelWork },
  { value: 'other', label: ar.profile.labelOther },
];

export default function AddressFormPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const isNew = params.id === 'new';
  const addressId = isNew ? null : (params.id as string);

  const [form, setForm] = useState<AddressForm>({
    label: 'home',
    governorate: '',
    area: '',
    block: '',
    road: '',
    building: '',
    floor: '',
    apartment: '',
    notes: '',
    isDefault: false,
  });
  
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isNew && addressId) {
      fetchAddress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, router, isNew, addressId]);

  const fetchAddress = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await authenticatedFetch(
        getApiUrl(`/users/me/addresses/${addressId}`)
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        if (response.status === 404) {
          router.push('/profile/addresses');
          return;
        }
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      if (data.success && data.data) {
        const addr = data.data;
        setForm({
          label: addr.label || 'home',
          governorate: addr.governorate || '',
          area: addr.area || '',
          block: addr.block || '',
          road: addr.road || '',
          building: addr.building || '',
          floor: addr.floor || '',
          apartment: addr.apartment || '',
          notes: addr.notes || '',
          isDefault: addr.isDefault || false,
        });
      }
    } catch {
      setError(ar.errors.somethingWrong);
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!form.governorate) {
      errors.governorate = ar.errors.requiredField;
    }
    if (!form.block) {
      errors.block = ar.errors.requiredField;
    }
    if (!form.road) {
      errors.road = ar.errors.requiredField;
    }
    if (!form.building) {
      errors.building = ar.errors.requiredField;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSaving(true);
      setError(null);

      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const url = isNew
        ? getApiUrl('/users/me/addresses')
        : getApiUrl(`/users/me/addresses/${addressId}`);

      const response = await authenticatedFetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: form.label,
          governorate: form.governorate,
          area: form.area || null,
          block: form.block,
          road: form.road,
          building: form.building,
          floor: form.floor || null,
          apartment: form.apartment || null,
          notes: form.notes || null,
          isDefault: form.isDefault,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save address');
      }

      router.push('/profile/addresses');
    } catch (err) {
      setError(err instanceof Error ? err.message : ar.errors.somethingWrong);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof AddressForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] animate-pulse mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">{ar.ui.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]" dir="rtl">
      {/* Header */}
      <header className="bg-[var(--bg-secondary)] shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {isNew ? ar.profile.addAddress : ar.profile.editAddress}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card padding="lg">
          <div className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-[var(--bg-error)] text-[var(--text-error)] text-sm">
                {error}
              </div>
            )}

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {ar.profile.addressLabel}
              </label>
              <div className="flex gap-2">
                {LABELS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => updateField('label', item.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      form.label === item.value
                        ? 'bg-[var(--bg-accent)] text-[var(--text-on-accent)]'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Governorate */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {ar.profile.governorate} *
              </label>
              <Select
                value={form.governorate}
                onChange={(value) => updateField('governorate', value as string)}
                options={GOVERNORATES}
                placeholder={ar.profile.governorate}
                error={!!validationErrors.governorate}
              />
              {validationErrors.governorate && (
                <p className="mt-1 text-sm text-[var(--text-error)]">{validationErrors.governorate}</p>
              )}
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {ar.profile.area}
              </label>
              <Input
                value={form.area}
                onChange={(e) => updateField('area', e.target.value)}
                placeholder={ar.profile.area}
              />
            </div>

            {/* Block, Road, Building in grid */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {ar.profile.block} *
                </label>
                <Input
                  value={form.block}
                  onChange={(e) => updateField('block', e.target.value)}
                  placeholder="123"
                  error={validationErrors.block}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {ar.profile.road} *
                </label>
                <Input
                  value={form.road}
                  onChange={(e) => updateField('road', e.target.value)}
                  placeholder="456"
                  error={validationErrors.road}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {ar.profile.building} *
                </label>
                <Input
                  value={form.building}
                  onChange={(e) => updateField('building', e.target.value)}
                  placeholder="789"
                  error={validationErrors.building}
                />
              </div>
            </div>

            {/* Floor and Apartment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {ar.profile.floor} ({ar.common.optional})
                </label>
                <Input
                  value={form.floor}
                  onChange={(e) => updateField('floor', e.target.value)}
                  placeholder="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  {ar.profile.apartment} ({ar.common.optional})
                </label>
                <Input
                  value={form.apartment}
                  onChange={(e) => updateField('apartment', e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {ar.profile.additionalNotes} ({ar.common.optional})
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder={ar.profile.additionalNotes}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-accent)] resize-none"
              />
            </div>

            {/* Set as Default */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => updateField('isDefault', e.target.checked)}
                className="w-5 h-5 rounded-xl accent-[var(--bg-accent)]"
              />
              <span className="text-[var(--text-primary)]">
                {ar.profile.setAsDefault}
              </span>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                fullWidth
              >
                {isSaving ? ar.ui.loading : ar.ui.save}
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.back()}
                disabled={isSaving}
                fullWidth
              >
                {ar.ui.cancel}
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
