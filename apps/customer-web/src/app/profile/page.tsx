'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Dialog } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
import { useAuth, getAccessToken } from '../../context/auth-context';

interface UserProfile {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch profile on mount
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchProfile();
  }, [isAuthenticated, authLoading, router]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setProfile(data.data);
      }
    } catch {
      setError(ar.errors.somethingWrong);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditOpen = () => {
    if (profile) {
      setEditName(profile.name || '');
      setEditEmail(profile.email || '');
      setSaveError(null);
      setIsEditOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName || null,
          email: editEmail || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setProfile(data.data);
        setIsEditOpen(false);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : ar.errors.somethingWrong);
    } finally {
      setIsSaving(false);
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
        <Card padding="lg">
          <div className="text-center">
            <p className="text-[var(--text-error)] mb-4">{error}</p>
            <Button onClick={fetchProfile}>{ar.ui.back}</Button>
          </div>
        </Card>
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
            {ar.profile.myProfile}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card padding="lg">
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                <span className="text-3xl font-bold text-[var(--text-secondary)]">
                  {profile?.name?.charAt(0) || profile?.phone?.charAt(0) || '?'}
                </span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  {ar.profile.name}
                </label>
                <p className="text-[var(--text-primary)] font-medium">
                  {profile?.name || '-'}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  {ar.profile.phoneReadOnly}
                </label>
                <p className="text-[var(--text-primary)] font-medium" dir="ltr">
                  +973 {profile?.phone}
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  {ar.profile.email}
                </label>
                <p className="text-[var(--text-primary)] font-medium">
                  {profile?.email || '-'}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <Button onClick={handleEditOpen} fullWidth>
              {ar.profile.editProfile}
            </Button>
          </div>
        </Card>

        {/* Addresses Link */}
        <Card padding="lg">
          <button
            onClick={() => router.push('/profile/addresses')}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-[var(--text-primary)] font-medium">
                {ar.profile.myAddresses}
              </span>
            </div>
            <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </Card>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={ar.profile.editProfile}
      >
        <div className="space-y-4">
          {saveError && (
            <div className="p-3 rounded-xl bg-[var(--bg-error)] text-[var(--text-error)] text-sm">
              {saveError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {ar.profile.fullName}
            </label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={ar.profile.fullName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {ar.profile.email}
            </label>
            <Input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder={ar.profile.email}
              dir="ltr"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              fullWidth
            >
              {isSaving ? ar.ui.loading : ar.profile.saveChanges}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsEditOpen(false)}
              disabled={isSaving}
              fullWidth
            >
              {ar.ui.cancel}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
