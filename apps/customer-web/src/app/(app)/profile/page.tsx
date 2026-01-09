'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Dialog, Avatar } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { useAuth, getAccessToken } from '@/context/auth-context';
import { MapPin, ChevronLeft } from 'lucide-react';

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
      setError(en.errors.somethingWrong);
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
      setSaveError(err instanceof Error ? err.message : en.errors.somethingWrong);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-[var(--spacing-2xl)] text-center">
        <p className="text-[var(--text-secondary)]">{en.ui.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-[var(--spacing-2xl)] text-center">
          <p className="mb-[var(--spacing-lg)] text-[var(--text-error)]">{error}</p>
          <Button onClick={fetchProfile}>{en.ui.back}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-[800px] p-[var(--spacing-xl)]">
      {/* Page Header */}
      <div className="mb-[var(--spacing-xl)]">
        <h1 className="text-[length:var(--font-size-h1)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
          {en.profile.myProfile}
        </h1>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-[var(--spacing-xl)]">
          <div className="flex flex-col gap-[var(--spacing-xl)]">
            {/* Avatar */}
            <div className="flex justify-center">
              <Avatar
                name={profile?.name || profile?.phone || '?'}
                size="xl"
              />
            </div>

            {/* Profile Info */}
            <div className="flex flex-col gap-[var(--spacing-lg)]">
              {/* Name */}
              <div>
                <label className="mb-[var(--spacing-xs)] block text-[length:var(--font-size-small)] text-[var(--text-secondary)]">
                  {en.profile.name}
                </label>
                <p className="text-[length:var(--font-size-base)] font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                  {profile?.name || '-'}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-[var(--spacing-xs)] block text-[length:var(--font-size-small)] text-[var(--text-secondary)]">
                  {en.profile.phoneReadOnly}
                </label>
                <p className="text-[length:var(--font-size-base)] font-[var(--font-weight-medium)] text-[var(--text-primary)]" dir="ltr">
                  +973 {profile?.phone}
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="mb-[var(--spacing-xs)] block text-[length:var(--font-size-small)] text-[var(--text-secondary)]">
                  {en.profile.email}
                </label>
                <p className="text-[length:var(--font-size-base)] font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                  {profile?.email || '-'}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <Button variant="default" size="md" onClick={handleEditOpen} className="w-full">
              {en.profile.editProfile}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mt-[var(--spacing-xl)]">
        <h2 className="mb-[var(--spacing-md)] text-[length:var(--font-size-h3)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          {en.profile.accountSettings || 'Account Settings'}
        </h2>

        <Card>
          <CardContent className="p-0">
            <button
              onClick={() => router.push('/profile/addresses')}
              className="flex w-full cursor-pointer items-center justify-between border-none bg-transparent p-[var(--spacing-lg)] transition-[background] duration-200 hover:bg-[var(--bg-hover)]"
            >
              <div className="flex items-center gap-[var(--spacing-md)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-tertiary)]">
                  <MapPin size={20} className="text-[var(--text-secondary)]" />
                </div>
                <span className="text-[length:var(--font-size-base)] font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                  {en.profile.myAddresses}
                </span>
              </div>
              <ChevronLeft size={20} className="text-[var(--text-secondary)]" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={en.profile.editProfile}
      >
        <div className="flex flex-col gap-[var(--spacing-lg)]">
          {saveError && (
            <div className="rounded-xl bg-[var(--bg-error)] p-[var(--spacing-md)] text-[length:var(--font-size-small)] text-[var(--text-error)]">
              {saveError}
            </div>
          )}

          <div>
            <label className="mb-[var(--spacing-sm)] block text-[length:var(--font-size-small)] font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              {en.profile.fullName}
            </label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={en.profile.fullName}
            />
          </div>

          <div>
            <label className="mb-[var(--spacing-sm)] block text-[length:var(--font-size-small)] font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              {en.profile.email}
            </label>
            <Input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder={en.profile.email}
              dir="ltr"
            />
          </div>

          <div className="flex gap-[var(--spacing-md)] pt-[var(--spacing-sm)]">
            <Button
              variant="default"
              size="md"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? en.ui.loading : en.profile.saveChanges}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsEditOpen(false)}
              disabled={isSaving}
              className="flex-1"
            >
              {en.ui.cancel}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
