'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Dialog, Avatar } from '@nasneh/ui';
import { ar } from '@nasneh/ui/copy';
import { useAuth, getAccessToken } from '@/context/auth-context';
import { AppShell } from '@/components/layout/app-shell';
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
      <AppShell>
        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>{ar.ui.loading}</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <Card>
          <CardContent style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            <p style={{ color: 'var(--text-error)', marginBottom: 'var(--spacing-lg)' }}>{error}</p>
            <Button onClick={fetchProfile}>{ar.ui.back}</Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h1
            style={{
              fontSize: 'var(--font-size-h1)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
            }}
          >
            {ar.profile.myProfile}
          </h1>
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent style={{ padding: 'var(--spacing-xl)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
              {/* Avatar */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar
                  name={profile?.name || profile?.phone || '?'}
                  size="xl"
                />
              </div>

              {/* Profile Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                {/* Name */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--spacing-xs)',
                    }}
                  >
                    {ar.profile.name}
                  </label>
                  <p
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--font-size-base)',
                    }}
                  >
                    {profile?.name || '-'}
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--spacing-xs)',
                    }}
                  >
                    {ar.profile.phoneReadOnly}
                  </label>
                  <p
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--font-size-base)',
                    }}
                    dir="ltr"
                  >
                    +973 {profile?.phone}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--spacing-xs)',
                    }}
                  >
                    {ar.profile.email}
                  </label>
                  <p
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--font-size-base)',
                    }}
                  >
                    {profile?.email || '-'}
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              <Button variant="default" size="md" onClick={handleEditOpen} style={{ width: '100%' }}>
                {ar.profile.editProfile}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div style={{ marginTop: 'var(--spacing-xl)' }}>
          <h2
            style={{
              fontSize: 'var(--font-size-h3)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            إعدادات الحساب
          </h2>

          <Card>
            <CardContent style={{ padding: 0 }}>
              <button
                onClick={() => router.push('/profile/addresses')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--spacing-lg)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                className="hover:bg-[var(--bg-hover)]"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--bg-tertiary)',
                    }}
                    className="rounded-xl"
                  >
                    <MapPin size={20} style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <span
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--font-size-base)',
                    }}
                  >
                    {ar.profile.myAddresses}
                  </span>
                </div>
                <ChevronLeft size={20} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={ar.profile.editProfile}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {saveError && (
            <div
              style={{
                padding: 'var(--spacing-md)',
                background: 'var(--bg-error)',
                color: 'var(--text-error)',
                fontSize: 'var(--font-size-small)',
              }}
              className="rounded-xl"
            >
              {saveError}
            </div>
          )}

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-small)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-sm)',
              }}
            >
              {ar.profile.fullName}
            </label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={ar.profile.fullName}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-size-small)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-sm)',
              }}
            >
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

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', paddingTop: 'var(--spacing-sm)' }}>
            <Button
              variant="default"
              size="md"
              onClick={handleSaveProfile}
              disabled={isSaving}
              style={{ flex: 1 }}
            >
              {isSaving ? ar.ui.loading : ar.profile.saveChanges}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsEditOpen(false)}
              disabled={isSaving}
              style={{ flex: 1 }}
            >
              {ar.ui.cancel}
            </Button>
          </div>
        </div>
      </Dialog>
    </AppShell>
  );
}
