'use client';

import React, { useState, useEffect } from 'react';
import { Skeleton } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { ServiceCard } from '@/components/listing/service-card';
import { SortSelect } from '@/components/listing/sort-select';
import { Pagination } from '@/components/listing/pagination';
import { ListingEmptyState } from '@/components/listing/listing-empty-state';

interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image?: string;
  providerName?: string;
  serviceType?: string;
  categorySlug?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [sortValue, setSortValue] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [sortValue, pagination.page]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy: sortValue,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/services?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setServices(data.data || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (value: string) => {
    setSortValue(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-[var(--spacing-lg)] py-[var(--spacing-2xl)]">
      <div className="mb-[var(--spacing-2xl)]">
        <h1 className="mb-[var(--spacing-md)] text-[length:var(--font-size-3xl)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
          {en.listing.allServices}
        </h1>
        
        <div className="flex items-center justify-between">
          <p className="text-[length:var(--font-size-base)] text-[var(--text-secondary)]">
            {pagination.total > 0 && (
              <>
                {en.listing.showing} {services.length} {en.listing.of} {pagination.total} {en.listing.results}
              </>
            )}
          </p>
          
          {!loading && services.length > 0 && (
            <SortSelect
              type="services"
              value={sortValue}
              onChange={handleSortChange}
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-[var(--spacing-lg)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[350px] rounded-[var(--spacing-xl)]" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <ListingEmptyState type="services" />
      ) : (
        <>
          <div className="mb-[var(--spacing-2xl)] grid grid-cols-1 gap-[var(--spacing-lg)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
