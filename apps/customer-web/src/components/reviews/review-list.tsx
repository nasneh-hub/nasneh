'use client';

import { useState, useEffect } from 'react';
import { Button, Skeleton } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { ReviewCard } from './review-card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface ReviewListProps {
  itemType: 'product' | 'service';
  itemId: string;
}

export function ReviewList({ itemType, itemId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/reviews?itemType=${itemType}&itemId=${itemId}&page=${page}&limit=${limit}`
        );
        const data = await response.json();
        setReviews(data.reviews || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        setReviews([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [itemType, itemId, page]);

  const totalPages = Math.ceil(total / limit);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-mono-3 p-6">
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl bg-mono-2 p-12 text-center">
        <div className="mx-auto max-w-md">
          <div className="mb-4 text-4xl">📝</div>
          <h3 className="mb-2 text-lg font-medium text-mono-12">
            {en.reviews.noReviews}
          </h3>
          <p className="text-mono-11">{en.reviews.noReviewsDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={!hasPrev}
          >
            <ChevronLeft className="h-4 w-4" />
            {en.listing.previous}
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext}
          >
            {en.listing.next}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
