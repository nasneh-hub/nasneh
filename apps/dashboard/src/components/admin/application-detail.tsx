'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Skeleton, Dialog, Textarea, Toast, ToastContainer } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { api } from '../../lib/api';

type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type ApplicationType = 'vendor' | 'provider';

interface BaseApplication {
  id: string;
  userId: string;
  businessName: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
}

interface VendorApplication extends BaseApplication {
  crNumber?: string;
  category: string;
  description?: string;
}

interface ProviderApplication extends BaseApplication {
  category: string;
  qualifications?: string;
  description?: string;
}

interface ApplicationDetailProps {
  type: string;
  id: string;
}

export function ApplicationDetail({ type, id }: ApplicationDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<VendorApplication | ProviderApplication | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const applicationType: ApplicationType = type as ApplicationType;
  const isVendor = applicationType === 'vendor';

  // Fetch application
  useEffect(() => {
    async function fetchApplication() {
      setLoading(true);
      setError(null);

      try {
        let response;
        if (isVendor) {
          response = await api.getVendorApplication(id) as { success: boolean; data: VendorApplication };
        } else {
          response = await api.getProviderApplication(id) as { success: boolean; data: ProviderApplication };
        }

        if (response.success) {
          setApplication(response.data);
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes('Authorization') || err.message.includes('401')) {
            setError(en.admin.applications.errors.unauthorized);
          } else if (err.message.includes('Not Found') || err.message.includes('404')) {
            setError(en.admin.applications.errors.notFound);
          } else {
            setError(en.admin.applications.errors.loadFailed);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [id, isVendor]);

  // Handle approve
  async function handleApprove() {
    if (!application) return;

    setIsSubmitting(true);
    try {
      if (isVendor) {
        await api.approveVendorApplication(id);
      } else {
        await api.approveProviderApplication(id);
      }

      setToastMessage({ message: en.admin.applications.success.approved, variant: 'success' });
      setTimeout(() => router.push('/admin/applications'), 1500);
    } catch (err) {
      if (err instanceof Error) {
        setToastMessage({ message: en.admin.applications.errors.approveFailed, variant: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle reject
  async function handleReject() {
    if (!application || !rejectReason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isVendor) {
        await api.rejectVendorApplication(id, rejectReason);
      } else {
        await api.rejectProviderApplication(id, rejectReason);
      }

      setToastMessage({ message: en.admin.applications.success.rejected, variant: 'success' });
      setIsRejectModalOpen(false);
      setTimeout(() => router.push('/admin/applications'), 1500);
    } catch (err) {
      if (err instanceof Error) {
        setToastMessage({ message: en.admin.applications.errors.rejectFailed, variant: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Extract CR number from description (format: [CR=number])
  function extractCRNumber(description?: string): string | null {
    if (!description) return null;
    const match = description.match(/\[CR=([^\]]+)\]/);
    return match ? match[1] : null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card padding="lg">
          <Skeleton className="h-32 w-full" />
        </Card>
        <Card padding="lg">
          <Skeleton className="h-48 w-full" />
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !application) {
    return (
      <div className="space-y-6">
        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/admin/applications')}
          >
            ← {en.admin.applications.detail.back}
          </Button>
        </div>
        <Card padding="lg">
          <div className="text-center py-12">
            <p className="text-[var(--text-secondary)] mb-4">{error}</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              {en.ui.tryAgain}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const statusVariant =
    application.status === 'APPROVED' ? 'success' :
    application.status === 'REJECTED' ? 'danger' :
    'default';

  const statusText =
    application.status === 'APPROVED' ? en.admin.applications.status.approved :
    application.status === 'REJECTED' ? en.admin.applications.status.rejected :
    en.admin.applications.status.pending;

  const crNumber = isVendor ? (application as VendorApplication).crNumber || extractCRNumber(application.description) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/admin/applications')}
          >
            ← {en.admin.applications.detail.back}
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {application.businessName}
            </h1>
            <Badge variant={isVendor ? 'default' : 'info'}>
              {isVendor ? en.admin.applications.tabs.vendors : en.admin.applications.tabs.providers}
            </Badge>
            <Badge variant={statusVariant}>{statusText}</Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {en.admin.applications.table.submitted}: {new Date(application.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Applicant Info */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          {en.admin.applications.detail.applicantInfo}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{en.admin.applications.detail.name}</p>
            <p className="text-base text-[var(--text-primary)]">
              {application.user?.name || en.admin.applications.detail.notProvided}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{en.admin.applications.detail.phone}</p>
            <p className="text-base text-[var(--text-primary)]">
              {application.user?.phone || en.admin.applications.detail.notProvided}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{en.admin.applications.detail.email}</p>
            <p className="text-base text-[var(--text-primary)]">
              {application.user?.email || en.admin.applications.detail.notProvided}
            </p>
          </div>
        </div>
      </Card>

      {/* Business Info */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          {en.admin.applications.detail.businessInfo}
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{en.admin.applications.table.business}</p>
            <p className="text-base text-[var(--text-primary)]">{application.businessName}</p>
          </div>
          
          {crNumber && (
            <div>
              <p className="text-sm text-[var(--text-secondary)]">{en.admin.applications.detail.crNumber}</p>
              <p className="text-base text-[var(--text-primary)]">{crNumber}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-[var(--text-secondary)]">{en.admin.applications.detail.category}</p>
            <p className="text-base text-[var(--text-primary)]">{application.category}</p>
          </div>

          {!isVendor && (application as ProviderApplication).qualifications && (
            <div>
              <p className="text-sm text-[var(--text-secondary)]">{en.admin.applications.detail.qualifications}</p>
              <p className="text-base text-[var(--text-primary)]">
                {(application as ProviderApplication).qualifications}
              </p>
            </div>
          )}

          {application.description && (
            <div>
              <p className="text-sm text-[var(--text-secondary)]">{en.admin.applications.detail.description}</p>
              <p className="text-base text-[var(--text-primary)]">{application.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Documents */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          {en.admin.applications.detail.documents}
        </h2>
        <div className="text-center py-8">
          <p className="text-sm text-[var(--text-secondary)]">
            {en.admin.applications.detail.documentsComingSoon}
          </p>
        </div>
      </Card>

      {/* Admin Notes */}
      {application.notes && (
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            {en.admin.applications.detail.adminNotes}
          </h2>
          <p className="text-base text-[var(--text-primary)]">{application.notes}</p>
        </Card>
      )}

      {/* Actions */}
      {application.status === 'PENDING' && (
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            {en.admin.applications.detail.actions}
          </h2>
          <div className="flex gap-4">
            <Button
              variant="default"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {en.admin.applications.detail.approve}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsRejectModalOpen(true)}
              disabled={isSubmitting}
            >
              {en.admin.applications.detail.reject}
            </Button>
          </div>
        </Card>
      )}

      {/* Reject Modal */}
      <Dialog
        open={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={en.admin.applications.reject.title}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {en.admin.applications.reject.reason}
            </label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={en.admin.applications.reject.reasonPlaceholder}
              rows={4}
            />
            {!rejectReason.trim() && (
              <p className="text-xs text-[var(--text-danger)] mt-1">
                {en.admin.applications.reject.reasonRequired}
              </p>
            )}
          </div>

          {/* Quick reasons */}
          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-2">Quick select:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRejectReason(en.admin.applications.reject.quickReasons.invalidLicense)}
              >
                {en.admin.applications.reject.quickReasons.invalidLicense}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRejectReason(en.admin.applications.reject.quickReasons.incompleteDocuments)}
              >
                {en.admin.applications.reject.quickReasons.incompleteDocuments}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRejectReason(en.admin.applications.reject.quickReasons.notEligible)}
              >
                {en.admin.applications.reject.quickReasons.notEligible}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRejectReason(en.admin.applications.reject.quickReasons.other)}
              >
                {en.admin.applications.reject.quickReasons.other}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectReason('');
              }}
              disabled={isSubmitting}
            >
              {en.admin.applications.reject.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || isSubmitting}
            >
              {en.admin.applications.reject.confirm}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Toast */}
      {toastMessage && (
        <ToastContainer position="top-right">
          <Toast
            message={toastMessage.message}
            variant={toastMessage.variant}
            duration={3000}
            closable
            onClose={() => setToastMessage(null)}
          />
        </ToastContainer>
      )}
    </div>
  );
}
