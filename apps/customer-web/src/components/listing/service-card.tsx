'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  providerName?: string;
  serviceType?: string;
  categorySlug?: string;
}

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/services/${service.id}`)}
      className="cursor-pointer overflow-hidden transition-transform duration-200 hover:-translate-y-1"
    >
      {service.image ? (
        <img
          src={service.image}
          alt={service.name}
          className="h-[200px] w-full object-cover"
        />
      ) : (
        <div className="h-[200px] w-full bg-[var(--bg-secondary)]" />
      )}
      
      <div className="p-[var(--spacing-lg)]">
        <div className="mb-[var(--spacing-sm)] flex gap-[var(--spacing-sm)]">
          {service.categorySlug && (
            <Badge variant="info">
              {service.categorySlug}
            </Badge>
          )}
          {service.serviceType && (
            <Badge variant="default">
              {service.serviceType}
            </Badge>
          )}
        </div>
        
        <h3 className="mb-[var(--spacing-sm)] text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          {service.name}
        </h3>
        
        {service.description && (
          <p className="mb-[var(--spacing-md)] line-clamp-2 text-[length:var(--font-size-sm)] text-[var(--text-secondary)]">
            {service.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            {service.price} {en.currency.bhd}
          </span>
          {service.providerName && (
            <span className="text-[length:var(--font-size-sm)] text-[var(--text-secondary)]">
              {service.providerName}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
