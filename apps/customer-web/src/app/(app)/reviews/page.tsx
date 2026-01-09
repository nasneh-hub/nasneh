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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews`, {
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
      <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
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
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: 'var(--text-secondary)' }}>{en.ui.loading}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-lg)',
        }}
      >
        <p style={{ color: 'var(--text-error)' }}>{error}</p>
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
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--spacing-xl)',
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1
          style={{
            fontSize: 'var(--font-size-h1)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {en.reviews.myReviews}
        </h1>
      </div>

      {/* Reviews Grid */}
      <div
        style={{
          display: 'grid',
          gap: 'var(--spacing-lg)',
        }}
      >
        {reviews.map((review) => (
          <Card key={review.id}>
            <div
              style={{
                padding: 'var(--spacing-xl)',
              }}
            >
              {/* Review Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 'var(--spacing-md)',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-md)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: 'var(--font-size-large)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text-primary)',
                      margin: 0,
                      marginBottom: 'var(--spacing-xs)',
                    }}
                  >
                    {review.reviewableName}
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      textTransform: 'capitalize',
                    }}
                  >
                    {review.reviewableType}
                  </p>
                </div>
                <div>
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Review Comment */}
              {review.comment && (
                <div
                  style={{
                    marginBottom: 'var(--spacing-md)',
                  }}
                >
                  <p
                    style={{
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-size-base)',
                      lineHeight: '1.6',
                      margin: 0,
                    }}
                  >
                    {review.comment}
                  </p>
                </div>
              )}

              {/* Review Date */}
              <div
                style={{
                  paddingTop: 'var(--spacing-md)',
                  borderTop: '1px solid var(--border-primary)',
                }}
              >
                <p
                  style={{
                    fontSize: 'var(--font-size-small)',
                    color: 'var(--text-tertiary)',
                    margin: 0,
                  }}
                >
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
