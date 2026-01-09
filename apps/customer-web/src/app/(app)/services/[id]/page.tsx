'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { en } from '@nasneh/ui/copy';
import { Button, Skeleton } from '@nasneh/ui';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { ImageGallery } from '@/components/product/image-gallery';
import { ServiceInfo } from '@/components/service/service-info';
import { RelatedServices } from '@/components/service/related-services';
import { ReviewsSummary } from '@/components/reviews/reviews-summary';
import { ReviewList } from '@/components/reviews/review-list';

interface Service {
  id: string;
  name: string;
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

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reviewsData, setReviewsData] = useState<{
    averageRating: number;
    totalReviews: number;
  }>({ averageRating: 0, totalReviews: 0 });

  useEffect(() => {
    async function fetchService() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.nasneh.com';
        const response = await fetch(`${apiUrl}/api/v1/services/${serviceId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
          }
          return;
        }

        const data = await response.json();
        if (data.success && data.data) {
          setService(data.data);

          // Fetch related services
          if (data.data.category?.slug) {
            const relatedResponse = await fetch(
              `${apiUrl}/api/v1/services?category=${data.data.category.slug}&limit=6`
            );
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              if (relatedData.success && relatedData.data) {
                // Filter out current service
                const filtered = relatedData.data.filter(
                  (s: Service) => s.id !== serviceId
                );
                setRelatedServices(filtered.slice(0, 6));
              }
            }
          }
          
          // Fetch reviews summary
          const reviewsResponse = await fetch(
            `${apiUrl}/api/v1/reviews?itemType=service&itemId=${serviceId}&limit=1`
          );
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            if (reviewsData.total) {
              setReviewsData({
                averageRating: reviewsData.averageRating || 0,
                totalReviews: reviewsData.total || 0,
              });
            }
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchService();
  }, [serviceId]);

  const handleBookNow = () => {
    // TODO: Implement booking flow (S5-03)
    router.push('/login');
  };

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-20 w-20 rounded-xl" />
              <Skeleton className="h-20 w-20 rounded-xl" />
              <Skeleton className="h-20 w-20 rounded-xl" />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (notFound || !service) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-6 text-6xl">🔧</div>
          <h1 className="mb-2 text-2xl font-bold text-mono-12">
            {en.service.notFound}
          </h1>
          <p className="mb-8 text-mono-11">
            {en.service.notFoundDescription}
          </p>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => router.push('/services')}
            >
              {en.service.backToServices}
            </Button>
            <Button onClick={() => router.push('/categories')}>
              {en.ui.browse} {en.navigation.categories}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: en.navigation.home, href: '/' },
            { label: en.navigation.services, href: '/services' },
            { label: service.name },
          ]}
        />
      </div>

      {/* Service Detail */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div>
          <ImageGallery images={service.images || []} alt={service.name} />
        </div>

        {/* Service Info */}
        <div>
          <ServiceInfo service={service} onBookNow={handleBookNow} />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-mono-12">
          {en.reviews.title}
        </h2>
        
        <div className="space-y-6">
          <ReviewsSummary
            averageRating={reviewsData.averageRating}
            totalReviews={reviewsData.totalReviews}
          />
          
          <ReviewList itemType="service" itemId={serviceId} />
        </div>
      </div>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <div className="mt-12">
          <RelatedServices services={relatedServices} />
        </div>
      )}
    </div>
  );
}
