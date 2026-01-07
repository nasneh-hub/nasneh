'use client';

import React from 'react';

/**
 * Avatar sizes
 */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Avatar Props
 */
export interface AvatarProps {
  /** Image source URL */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Fallback name for initials */
  name?: string;
  /** Avatar size */
  size?: AvatarSize;
  /** Show online status indicator */
  showStatus?: boolean;
  /** Online status */
  status?: 'online' | 'offline' | 'away';
  /** Additional Tailwind classes for layout */
  className?: string;
}

/**
 * Get initials from name
 */
const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * Size classes mapping
 */
const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

/**
 * Status indicator size classes
 */
const statusSizeClasses: Record<AvatarSize, string> = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
};

/**
 * Avatar Component
 * 
 * Display user photos with initials fallback and optional status indicator.
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  showStatus = false,
  status = 'offline',
  className = '',
}) => {
  const [imageError, setImageError] = React.useState(false);
  const showImage = src && !imageError;
  const initials = name ? getInitials(name) : '?';

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          overflow-hidden
          flex items-center justify-center
          bg-[var(--bg-tertiary)]
          text-[color:var(--text-secondary)]
          font-medium
          select-none
        `}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {showStatus && (
        <span
          className={`
            ${statusSizeClasses[size]}
            absolute bottom-0 right-0
            rounded-full
            ring-2 ring-[var(--bg-primary)]
            ${status === 'online' ? 'bg-[var(--color-success)]' : ''}
            ${status === 'away' ? 'bg-[var(--color-warning)]' : ''}
            ${status === 'offline' ? 'bg-[var(--text-tertiary)]' : ''}
          `}
        />
      )}
    </div>
  );
};

export default Avatar;
