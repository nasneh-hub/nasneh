'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { en } from '@nasneh/ui/copy';
import { Button } from '@nasneh/ui';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  type: 'HOME' | 'IN_STORE' | 'DELIVERY';
  provider: {
    id: string;
    name: string;
    location?: string;
  };
}

interface ServiceBookingClientProps {
  service: Service;
}

export function ServiceBookingClient({ service }: ServiceBookingClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-mono-12">{en.booking.pageTitle}</h1>
          <p className="mt-2 text-mono-11">{service.name}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {/* Booking Form Placeholder */}
        <div className="rounded-xl bg-mono-2 p-8 text-center">
          <p className="text-lg text-mono-11">
            {en.booking.step1Title}
          </p>
          <p className="mt-4 text-sm text-mono-10">
            Booking flow implementation in progress
          </p>
          <div className="mt-6">
            <Button
              variant="secondary"
              onClick={() => router.push(`/services/${service.id}`)}
            >
              {en.ui.back}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
