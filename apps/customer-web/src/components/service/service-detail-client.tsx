'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { en } from '@nasneh/ui/copy';
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { ImageGallery } from '@/components/product/image-gallery';
import { ServiceInfo } from '@/components/service/service-info';
import { RelatedServices } from '@/components/service/related-services';
import { ReviewsSummary } from '@/components/reviews/reviews-summary';
import { ReviewList } from '@/components/reviews/review-list';

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

interface ServiceDetailClientProps {
  service: Service;
  relatedServices: Service[];
  reviewsData: {
    averageRating: number;
    totalReviews: number;
  };
}

export function ServiceDetailClient({
  service,
  relatedServices,
  reviewsData,
}: ServiceDetailClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleBookNow = () => {
    if (!isAuthenticated) {
      // Store return URL for redirect after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('booking_return_url', `/services/${service.id}/book`);
      }
      router.push('/login');
    } else {
      // Navigate to booking flow
      router.push(`/services/${service.id}/book`);
    }
  };

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
        <h2 className="mb-6 text-2xl font-bold text-[var(--foreground)]">
          {en.reviews.title}
        </h2>
        
        <div className="space-y-6">
          {reviewsData.totalReviews > 0 && (
            <ReviewsSummary
              averageRating={reviewsData.averageRating}
              totalReviews={reviewsData.totalReviews}
            />
          )}
          
          <ReviewList
            itemType="service"
            itemId={service.id}
          />
        </div>
      </div>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-[var(--foreground)]">
            {en.service.relatedServices}
          </h2>
          <RelatedServices services={relatedServices} />
        </div>
      )}
    </div>
  );
}
