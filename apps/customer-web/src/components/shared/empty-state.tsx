/**
 * EmptyState Component
 * 
 * Reusable empty state component for consistent UI across all pages.
 * Used when lists/collections are empty (orders, bookings, reviews, etc.)
 * 
 * Single Source: All styling uses tokens.css variables
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
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--spacing-2xl)',
      }}
    >
      {/* Icon */}
      <div
        style={{
          marginBottom: 'var(--spacing-lg)',
          color: 'var(--text-tertiary)',
        }}
      >
        <Icon size={64} />
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: 'var(--font-size-h1)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--spacing-md)',
          margin: 0,
        }}
      >
        {title}
      </h1>

      {/* Description */}
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-size-large)',
          marginBottom: comingSoon || action ? 'var(--spacing-xl)' : 0,
          maxWidth: '500px',
        }}
      >
        {description}
      </p>

      {/* Coming Soon Badge */}
      {comingSoon && (
        <div
          style={{
            display: 'inline-block',
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-small)',
            fontWeight: 'var(--font-weight-medium)',
          }}
          className="rounded-xl"
        >
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
