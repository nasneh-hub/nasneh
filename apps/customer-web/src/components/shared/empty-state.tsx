/**
 * EmptyState Component
 * 
 * Reusable empty state component for consistent UI across all pages.
 * Used when lists/collections are empty (orders, bookings, reviews, etc.)
 * 
 * Single Source: All styling uses tokens.css variables via Tailwind classes
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@nasneh/ui';

interface EmptyStateProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Main heading text */
  title: string;
  /** Description text */
  description: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Optional "coming soon" badge */
  comingSoon?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  comingSoon,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-[var(--spacing-2xl)] text-center">
      {/* Icon */}
      <div className="mb-[var(--spacing-lg)] text-[var(--text-tertiary)]">
        <Icon size={64} />
      </div>

      {/* Title */}
      <h1 className="m-0 mb-[var(--spacing-md)] text-[length:var(--font-size-h1)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
        {title}
      </h1>

      {/* Description */}
      <p className={`max-w-[500px] text-[length:var(--font-size-large)] text-[var(--text-secondary)] ${comingSoon || action ? 'mb-[var(--spacing-xl)]' : 'mb-0'}`}>
        {description}
      </p>

      {/* Coming Soon Badge */}
      {comingSoon && (
        <div className="inline-block rounded-xl bg-[var(--bg-tertiary)] px-[var(--spacing-lg)] py-[var(--spacing-sm)] text-[length:var(--font-size-small)] font-[var(--font-weight-medium)] text-[var(--text-secondary)]">
          Coming Soon
        </div>
      )}

      {/* Action Button */}
      {action && !comingSoon && (
        <Button
          variant="default"
          size="lg"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
