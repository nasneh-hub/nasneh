'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { Card } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { useAuth, getAccessToken } from '@/context/auth-context';
import { EmptyState } from '@/components/shared/empty-state';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  reviewableType: 'product' | 'service';
  reviewableName: string;
  createdAt: string;
}

export default function ReviewsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchReviews();
  }, [isAuthenticated, authLoading, router]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setReviews(data.data);
      }
    } catch (err) {
      setError(en.errors.somethingWrong);
    } finally {
      setIsLoading(false);
    }
  };

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-[var(--spacing-xs)]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? 'var(--text-warning)' : 'none'}
            stroke={star <= rating ? 'var(--text-warning)' : 'var(--text-tertiary)'}
          />
        ))}
      </div>
    );
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-[var(--text-secondary)]">{en.ui.loading}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-[var(--spacing-lg)]">
        <p className="text-[var(--text-error)]">{error}</p>
      </div>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title={en.reviews.myReviews}
        description={en.reviews.reviewHistory}
      />
    );
  }

  // Reviews list
  return (
    <div className="mx-auto max-w-[1200px] p-[var(--spacing-xl)]">
      {/* Page Header */}
      <div className="mb-[var(--spacing-2xl)]">
        <h1 className="m-0 text-[length:var(--font-size-h1)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
          {en.reviews.myReviews}
        </h1>
      </div>

      {/* Reviews Grid */}
      <div className="grid gap-[var(--spacing-lg)]">
        {reviews.map((review) => (
          <Card key={review.id}>
            <div className="p-[var(--spacing-xl)]">
              {/* Review Header */}
              <div className="mb-[var(--spacing-md)] flex flex-wrap items-start justify-between gap-[var(--spacing-md)]">
                <div className="flex-1">
                  <p className="m-0 mb-[var(--spacing-xs)] text-[length:var(--font-size-large)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                    {review.reviewableName}
                  </p>
                  <p className="m-0 text-[length:var(--font-size-small)] capitalize text-[var(--text-secondary)]">
                    {review.reviewableType}
                  </p>
                </div>
                <div>
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Review Comment */}
              {review.comment && (
                <div className="mb-[var(--spacing-md)]">
                  <p className="m-0 text-[length:var(--font-size-base)] leading-[1.6] text-[var(--text-primary)]">
                    {review.comment}
                  </p>
                </div>
              )}

              {/* Review Date */}
              <div className="border-t border-[var(--border-primary)] pt-[var(--spacing-md)]">
                <p className="m-0 text-[length:var(--font-size-small)] text-[var(--text-tertiary)]">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
