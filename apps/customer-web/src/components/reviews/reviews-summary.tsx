'use client';

import { Card } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { RatingStars } from './rating-stars';

interface ReviewsSummaryProps {
  averageRating: number;
  totalReviews: number;
}

export function ReviewsSummary({
  averageRating,
  totalReviews,
}: ReviewsSummaryProps) {
  if (totalReviews === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-6">
        {/* Average Rating */}
        <div className="text-center">
          <div className="mb-2 text-4xl font-bold text-[var(--foreground)]">
            {averageRating.toFixed(1)}
          </div>
          <RatingStars rating={averageRating} size="md" />
        </div>

        {/* Divider */}
        <div className="h-16 w-px bg-[var(--secondary)]" />

        {/* Total Reviews */}
        <div>
          <div className="text-2xl font-semibold text-[var(--foreground)]">
            {totalReviews}
          </div>
          <div className="text-sm text-[var(--foreground)]">
            {en.reviews.basedOn.replace('{count}', totalReviews.toString())}
          </div>
        </div>
      </div>
    </Card>
  );
}
