import { notFound } from 'next/navigation';
import { ServiceBookingClient } from '@/components/service/service-booking-client';
import { getApiUrl } from '@/lib/api';

// Enable dynamic params and force dynamic rendering
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

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

async function fetchService(serviceId: string): Promise<Service | null> {
  try {
    const response = await fetch(getApiUrl(`/services/${serviceId}`), {
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }

    return null;
  } catch (error) {
    console.error('Error fetching service:', error);
    return null;
  }
}

/**
 * Service Booking Page (Server Component)
 * 
 * 3-step booking flow:
 * Step 1: Select Date & Time
 * Step 2: Service Location (address or provider location)
 * Step 3: Review & Confirm
 * 
 * Route: /services/[id]/book
 */
export default async function ServiceBookingPage({
  params,
}: {
  params: { slug: string };
}) {
  const serviceSlug = params.slug;

  // Fetch service data server-side
  const service = await fetchService(serviceSlug);

  // If service not found, trigger Next.js 404
  if (!service) {
    notFound();
  }

  return <ServiceBookingClient service={service} />;
}
