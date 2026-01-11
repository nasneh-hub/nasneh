import { notFound } from 'next/navigation';
import { ServiceDetailClient } from '@/components/service/service-detail-client';
import { getApiUrl } from '@/lib/api';

// Enable dynamic params and force dynamic rendering
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images?: string[];
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
}

async function fetchService(serviceSlug: string): Promise<Service | null> {
  try {
    const response = await fetch(getApiUrl(`/services/slug/${serviceSlug}`), {
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

async function fetchRelatedServices(categorySlug: string, currentServiceId: string): Promise<Service[]> {
  try {
    const response = await fetch(
      getApiUrl(`/services?category=${categorySlug}&limit=6`),
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (data.success && data.data) {
      // Filter out current service
      return data.data.filter((s: Service) => s.id !== currentServiceId).slice(0, 6);
    }

    return [];
  } catch (error) {
    console.error('Error fetching related services:', error);
    return [];
  }
}

async function fetchReviewsData(serviceSlug: string): Promise<{ averageRating: number; totalReviews: number }> {
  try {
    const response = await fetch(
      getApiUrl(`/reviews?itemType=service&itemId=${serviceSlug}&limit=1`),
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const data = await response.json();
    if (data.total) {
      return {
        averageRating: data.averageRating || 0,
        totalReviews: data.total || 0,
      };
    }

    return { averageRating: 0, totalReviews: 0 };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return { averageRating: 0, totalReviews: 0 };
  }
}

export default async function ServiceDetailPage({
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

  // Fetch related data in parallel
  const [relatedServices, reviewsData] = await Promise.all([
    service.category?.slug
      ? fetchRelatedServices(service.category.slug, serviceSlug)
      : Promise.resolve([]),
    fetchReviewsData(serviceSlug),
  ]);

  return (
    <ServiceDetailClient
      service={service}
      relatedServices={relatedServices}
      reviewsData={reviewsData}
    />
  );
}
