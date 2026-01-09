'use client';

import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const iconSize = sizeClasses[size];

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <Star
            key={i}
            className={`${iconSize} ${
              isFilled
                ? 'fill-primary text-primary'
                : 'fill-transparent text-mono-6'
            }`}
          />
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm text-mono-11">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
