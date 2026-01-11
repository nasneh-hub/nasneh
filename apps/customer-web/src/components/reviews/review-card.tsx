'use client';

import { Avatar, Card } from '@nasneh/ui';
import { RatingStars } from './rating-stars';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    createdAt: string;
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        {/* Author Avatar */}
        <Avatar
          name={review.author.name}
          size="md"
        />

        {/* Review Content */}
        <div className="flex-1">
          {/* Author Name & Date */}
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="font-medium text-[var(--foreground)]">
                {review.author.name}
              </div>
              <div className="text-sm text-[var(--foreground)]">
                {formatDate(review.createdAt)}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-3">
            <RatingStars rating={review.rating} size="sm" />
          </div>

          {/* Comment */}
          <p className="text-[var(--foreground)]">{review.comment}</p>
        </div>
      </div>
    </Card>
  );
}
