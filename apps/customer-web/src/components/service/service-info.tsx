'use client';

import { Button, Badge, Avatar } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/currency';

interface ServiceInfoProps {
  service: {
    id: string;
    name: string;
    description: string;
    price: number;
    serviceType?: string;
    availability?: string;
    provider?: {
      id: string;
      name: string;
      avatar?: string;
    };
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  onBookNow?: () => void;
}

export function ServiceInfo({ service, onBookNow }: ServiceInfoProps) {
  const isAvailable = service.availability !== 'unavailable';

  return (
    <div className="flex flex-col gap-6">
      {/* Service Name */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">{service.name}</h1>
        {service.serviceType && (
          <div className="mt-2">
            <Badge>{service.serviceType}</Badge>
          </div>
        )}
      </div>

      {/* Price */}
      <div>
        <div className="text-3xl font-bold text-[var(--foreground)]">
          {formatCurrency(service.price)}
        </div>
      </div>

      {/* Availability */}
      {service.availability && (
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isAvailable ? 'bg-primary' : 'bg-destructive'
            }`}
          />
          <span className="text-sm text-[var(--foreground)]">
            {isAvailable ? en.service.available : en.service.unavailable}
          </span>
        </div>
      )}

      {/* Provider */}
      {service.provider && (
        <div className="flex items-center gap-3 rounded-xl bg-[var(--muted)] p-4">
          <Avatar name={service.provider.name} size="md" />
          <div>
            <div className="text-sm text-[var(--foreground)]">{en.service.providedBy}</div>
            <Link
              href={`/providers/${service.provider.id}`}
              className="font-medium text-[var(--foreground)] hover:underline"
            >
              {service.provider.name}
            </Link>
          </div>
        </div>
      )}

      {/* Book Now Button */}
      <Button
        onClick={onBookNow}
        disabled={!isAvailable}
        className="w-full"
      >
        {isAvailable ? en.service.bookNow : en.service.unavailable}
      </Button>

      {/* Description */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
          {en.service.description}
        </h2>
        <p className="whitespace-pre-wrap text-[var(--foreground)]">{service.description}</p>
      </div>

      {/* Category */}
      {service.category && (
        <div>
            <div className="text-sm text-[var(--foreground)] mb-2">{en.navigation.categories}</div>
          <Link
            href={`/category/${service.category.slug}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--muted)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)]"
          >
            {service.category.name}
          </Link>
        </div>
      )}
    </div>
  );
}
