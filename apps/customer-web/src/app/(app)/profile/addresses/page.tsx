'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Badge, Dialog } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { useAuth, getAccessToken } from '@/context/auth-context';
import { authenticatedFetch, getApiUrl } from '@/lib/api';

interface Address {
  id: string;
  label: string;
  governorate: string;
  area: string | null;
  block: string;
  road: string;
  building: string;
  floor: string | null;
  apartment: string | null;
  notes: string | null;
  isDefault: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchAddresses();
  }, [isAuthenticated, authLoading, router]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await authenticatedFetch(getApiUrl('/users/me/addresses'));

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setAddresses(data.data);
      }
    } catch (err) {
      setError(en.errors.somethingWrong);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await authenticatedFetch(
        getApiUrl(`/users/me/addresses/${addressId}/default`),
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        // Update local state
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId,
        })));
      }
    } catch (err) {
      // Silent fail, user can retry
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setIsDeleting(true);
      
      const token = getAccessToken();
      if (!token) return;

      const response = await authenticatedFetch(
        getApiUrl(`/users/me/addresses/${deleteId}`),
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setAddresses(prev => prev.filter(addr => addr.id !== deleteId));
        setDeleteId(null);
      }
    } catch (err) {
      // Silent fail
    } finally {
      setIsDeleting(false);
    }
  };

  const formatAddress = (addr: Address) => {
    const parts = [
      addr.building && `${en.profile.building} ${addr.building}`,
      addr.road && `${en.profile.road} ${addr.road}`,
      addr.block && `${en.profile.block} ${addr.block}`,
      addr.area,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getLabelText = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home':
        return en.profile.labelHome;
      case 'work':
        return en.profile.labelWork;
      default:
        return label;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] animate-pulse mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">{en.ui.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]" dir="rtl">
      {/* Header */}
      <header className="bg-[var(--bg-secondary)] shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              {en.profile.myAddresses}
            </h1>
          </div>
          <Button
            size="sm"
            onClick={() => router.push('/profile/addresses/new')}
          >
            {en.profile.addAddress}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {error ? (
          <Card padding="lg">
            <div className="text-center">
              <p className="text-[var(--text-error)] mb-4">{error}</p>
              <Button onClick={fetchAddresses}>{en.ui.back}</Button>
            </div>
          </Card>
        ) : addresses.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-[var(--text-secondary)] mb-4">{en.profile.noAddresses}</p>
              <Button onClick={() => router.push('/profile/addresses/new')}>
                {en.profile.addFirstAddress}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Card key={address.id} padding="lg">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {getLabelText(address.label)}
                      </span>
                      {address.isDefault && (
                        <Badge variant="success" size="sm">
                          {en.profile.defaultAddress}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/profile/addresses/${address.id}`)}
                        className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                      >
                        <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteId(address.id)}
                        className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                      >
                        <svg className="w-5 h-5 text-[var(--text-error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Address */}
                  <p className="text-[var(--text-secondary)] text-sm">
                    {formatAddress(address)}
                  </p>

                  {/* Governorate */}
                  <p className="text-[var(--text-secondary)] text-sm">
                    {address.governorate}
                  </p>

                  {/* Notes */}
                  {address.notes && (
                    <p className="text-[var(--text-secondary)] text-sm italic">
                      {address.notes}
                    </p>
                  )}

                  {/* Set Default */}
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-sm text-[var(--text-accent)] hover:underline"
                    >
                      {en.profile.setAsDefault}
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title={en.profile.deleteAddress}
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            {en.profile.confirmDeleteAddress}
          </p>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              fullWidth
            >
              {isDeleting ? en.ui.loading : en.ui.delete}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
              fullWidth
            >
              {en.ui.cancel}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
