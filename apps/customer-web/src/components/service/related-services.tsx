'use client';

import { en } from '@nasneh/ui/copy';
import { ServiceCard } from '../listing/service-card';

interface RelatedServicesProps {
  services: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    images?: string[];
    serviceType?: string;
    provider?: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>;
}

export function RelatedServices({ services }: RelatedServicesProps) {
  if (services.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-2xl font-bold text-[var(--foreground)]">
        {en.service.relatedServices}
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
