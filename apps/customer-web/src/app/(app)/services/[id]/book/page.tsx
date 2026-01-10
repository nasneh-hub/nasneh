import { notFound } from 'next/navigation';
import { ServiceBookingClient } from '@/components/service/service-booking-client';

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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.nasneh.com/api/v1';
    const response = await fetch(`${apiUrl}/services/${serviceId}`, {
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
  params: { id: string };
}) {
  const serviceId = params.id;

  // Fetch service data server-side
  const service = await fetchService(serviceId);

  // If service not found, trigger Next.js 404
  if (!service) {
    notFound();
  }

  return <ServiceBookingClient service={service} />;
}
