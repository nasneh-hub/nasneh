'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Select, Tabs, Table, Badge, Skeleton } from '@nasneh/ui';
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

interface CombinedApplication {
  id: string;
  type: ApplicationType;
  applicantName: string;
  businessName: string;
  status: ApplicationStatus;
  submittedDate: string;
  crNumber?: string;
  phone?: string;
}

export function ApplicationsList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendorApps, setVendorApps] = useState<VendorApplication[]>([]);
  const [providerApps, setProviderApps] = useState<ProviderApplication[]>([]);
  
  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'vendors' | 'providers'>('all');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch applications
  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      setError(null);
      
      try {
        const [vendorResponse, providerResponse] = await Promise.all([
          api.getVendorApplications(statusFilter) as Promise<{ success: boolean; data: VendorApplication[]; count: number }>,
          api.getProviderApplications(statusFilter) as Promise<{ success: boolean; data: ProviderApplication[]; count: number }>,
        ]);

        if (vendorResponse.success) {
          setVendorApps(vendorResponse.data);
        }
        if (providerResponse.success) {
          setProviderApps(providerResponse.data);
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes('Authorization') || err.message.includes('401')) {
            setError(en.admin.applications.errors.unauthorized);
          } else {
            setError(en.admin.applications.errors.loadFailed);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [statusFilter]);

  // Combine and transform applications
  const combinedApplications = useMemo<CombinedApplication[]>(() => {
    const vendors: CombinedApplication[] = vendorApps.map((app) => ({
      id: app.id,
      type: 'vendor' as ApplicationType,
      applicantName: app.user?.name || 'N/A',
      businessName: app.businessName,
      status: app.status,
      submittedDate: new Date(app.createdAt).toLocaleDateString(),
      crNumber: app.crNumber,
      phone: app.user?.phone,
    }));

    const providers: CombinedApplication[] = providerApps.map((app) => ({
      id: app.id,
      type: 'provider' as ApplicationType,
      applicantName: app.user?.name || 'N/A',
      businessName: app.businessName,
      status: app.status,
      submittedDate: new Date(app.createdAt).toLocaleDateString(),
      phone: app.user?.phone,
    }));

    return [...vendors, ...providers];
  }, [vendorApps, providerApps]);

  // Filter by tab
  const filteredByTab = useMemo(() => {
    if (activeTab === 'vendors') {
      return combinedApplications.filter((app) => app.type === 'vendor');
    }
    if (activeTab === 'providers') {
      return combinedApplications.filter((app) => app.type === 'provider');
    }
    return combinedApplications;
  }, [combinedApplications, activeTab]);

  // Filter by search
  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return filteredByTab;
    
    const query = searchQuery.toLowerCase();
    return filteredByTab.filter((app) =>
      app.businessName.toLowerCase().includes(query) ||
      app.applicantName.toLowerCase().includes(query) ||
      app.crNumber?.toLowerCase().includes(query) ||
      app.phone?.includes(query)
    );
  }, [filteredByTab, searchQuery]);

  // Paginate
  const totalPages = Math.ceil(filteredBySearch.length / itemsPerPage);
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBySearch.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBySearch, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter, searchQuery]);

  // Table columns
  const columns = [
    {
      key: 'id',
      header: en.admin.applications.table.id,
      width: 'w-24',
      render: (app: CombinedApplication) => (
        <span className="text-xs text-[var(--text-secondary)] font-mono">
          {app.id.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'applicant',
      header: en.admin.applications.table.applicant,
      render: (app: CombinedApplication) => (
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {app.applicantName}
          </div>
          {app.phone && (
            <div className="text-xs text-[var(--text-secondary)]">{app.phone}</div>
          )}
        </div>
      ),
    },
    {
      key: 'business',
      header: en.admin.applications.table.business,
      render: (app: CombinedApplication) => (
        <div className="text-sm text-[var(--text-primary)]">{app.businessName}</div>
      ),
    },
    {
      key: 'type',
      header: en.admin.applications.table.type,
      width: 'w-28',
      render: (app: CombinedApplication) => (
        <Badge variant={app.type === 'vendor' ? 'default' : 'info'}>
          {app.type === 'vendor' ? en.admin.applications.tabs.vendors : en.admin.applications.tabs.providers}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: en.admin.applications.table.status,
      width: 'w-32',
      render: (app: CombinedApplication) => {
        const statusVariant = 
          app.status === 'APPROVED' ? 'success' : 
          app.status === 'REJECTED' ? 'danger' : 
          'default';
        
        const statusText = 
          app.status === 'APPROVED' ? en.admin.applications.status.approved :
          app.status === 'REJECTED' ? en.admin.applications.status.rejected :
          en.admin.applications.status.pending;

        return <Badge variant={statusVariant}>{statusText}</Badge>;
      },
    },
    {
      key: 'submitted',
      header: en.admin.applications.table.submitted,
      width: 'w-32',
      render: (app: CombinedApplication) => (
        <span className="text-sm text-[var(--text-secondary)]">{app.submittedDate}</span>
      ),
    },
    {
      key: 'actions',
      header: en.admin.applications.table.actions,
      width: 'w-24',
      align: 'center' as const,
      render: (app: CombinedApplication) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push(`/admin/applications/${app.type}/${app.id}`)}
        >
          {en.admin.applications.view}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {en.admin.applications.title}
        </h1>
      </div>

      {/* Filters */}
      <Card padding="lg">
        <div className="space-y-4">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(value) => setActiveTab(value as typeof activeTab)}
            tabs={[
              { value: 'all', label: en.admin.applications.tabs.all },
              { value: 'vendors', label: en.admin.applications.tabs.vendors },
              { value: 'providers', label: en.admin.applications.tabs.providers },
            ]}
          />

          {/* Status Filter + Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as ApplicationStatus)}
                options={[
                  { value: 'PENDING', label: en.admin.applications.status.pending },
                  { value: 'APPROVED', label: en.admin.applications.status.approved },
                  { value: 'REJECTED', label: en.admin.applications.status.rejected },
                ]}
              />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                placeholder={en.admin.applications.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-[var(--text-secondary)] mb-4">{error}</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              {en.ui.tryAgain}
            </Button>
          </div>
        ) : paginatedApplications.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[var(--text-secondary)]">{en.admin.applications.empty}</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={paginatedApplications}
              rowKey={(app) => app.id}
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 flex items-center justify-between">
                <p className="text-sm text-[var(--text-secondary)]">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    {en.ui.previous}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    {en.ui.next}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
