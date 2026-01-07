'use client';

import React, { useState, useMemo } from 'react';

/**
 * Avatar Props
 */
export interface AvatarProps {
  /**
   * User/vendor name (for initials and alt text)
   */
  name: string;
  
  /**
   * Image URL
   */
  src?: string;
  
  /**
   * Size of the avatar
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Optional status indicator
   */
  status?: 'online' | 'offline' | 'busy' | 'away';
  
  /**
   * Whether the avatar is clickable
   * @default false
   */
  clickable?: boolean;
  
  /**
   * Click handler (only works if clickable=true)
   */
  onClick?: () => void;
}

/**
 * Generate initials from name
 * - English: first 2 letters of first 2 words
 * - Arabic: first letter only
 */
const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const trimmed = name.trim();
  
  // Check if Arabic (contains Arabic characters)
  const isArabic = /[\u0600-\u06FF]/.test(trimmed);
  
  if (isArabic) {
    // Arabic: first letter only
    return trimmed.charAt(0);
  }
  
  // English: first letter of first 2 words
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
};

/**
 * Generate a consistent background color from name
 */
const getBackgroundColor = (name: string): string => {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate HSL color with fixed saturation and lightness for consistency
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 45%, 55%)`;
};

/**
 * Determine if text should be light or dark based on background
 */
const getTextColor = (bgColor: string): string => {
  // For our HSL colors with 55% lightness, white text works well
  return 'var(--color-text-inverse)';
};

/**
 * Size configurations
 */
const sizeConfig = {
  sm: {
    size: 32,
    fontSize: 'var(--font-size-caption)',
    statusSize: 8,
    statusBorder: 2,
  },
  md: {
    size: 40,
    fontSize: 'var(--font-size-small)',
    statusSize: 10,
    statusBorder: 2,
  },
  lg: {
    size: 56,
    fontSize: '1.125rem', // 18px
    statusSize: 12,
    statusBorder: 3,
  },
};

/**
 * Status color mapping
 */
const statusColors = {
  online: 'var(--color-success)',
  offline: 'var(--text-tertiary)',
  busy: 'var(--color-danger)',
  away: 'var(--color-warning)',
};

/**
 * Avatar Component
 * 
 * Display user or vendor profile photos with fallback to initials.
 * 
 * @example
 * ```tsx
 * import { Avatar } from '@nasneh/ui';
 * 
 * // With image
 * <Avatar name="أحمد محمد" src="/avatars/ahmed.jpg" size="md" />
 * 
 * // Initials fallback
 * <Avatar name="سارة علي" size="lg" />
 * 
 * // With status
 * <Avatar name="Mohammed" src="/avatar.jpg" status="online" />
 * ```
 */
export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  status,
  clickable = false,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  
  const config = sizeConfig[size];
  const initials = useMemo(() => getInitials(name), [name]);
  const bgColor = useMemo(() => getBackgroundColor(name), [name]);
  const textColor = useMemo(() => getTextColor(bgColor), [bgColor]);
  
  const showImage = src && !imageError;
  
  // Container styles
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: config.size,
    height: config.size,
    minWidth: config.size,
    minHeight: config.size,
    borderRadius: 'var(--radius-full)',
    backgroundColor: showImage ? 'var(--bg-tertiary)' : bgColor,
    overflow: 'hidden',
    cursor: clickable ? 'pointer' : 'default',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    fontFamily: 'var(--font-family-primary)',
  };
  
  // Image styles
  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };
  
  // Initials styles
  const initialsStyles: React.CSSProperties = {
    fontSize: config.fontSize,
    fontWeight: 'var(--font-weight-semibold)' as any,
    color: textColor,
    userSelect: 'none',
    lineHeight: 1,
  };
  
  // Status indicator styles
  const statusStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: config.statusSize,
    height: config.statusSize,
    borderRadius: 'var(--radius-full)',
    backgroundColor: status ? statusColors[status] : 'transparent',
    boxShadow: `0 0 0 ${config.statusBorder}px var(--bg-primary)`,
  };
  
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (clickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };
  
  const Component = clickable ? 'button' : 'div';
  
  return (
    <Component
      type={clickable ? 'button' : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? name : undefined}
      style={containerStyles}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          style={imageStyles}
          onError={() => setImageError(true)}
        />
      ) : (
        <span style={initialsStyles}>{initials}</span>
      )}
      
      {status && <span style={statusStyles} aria-label={status} />}
    </Component>
  );
};

export default Avatar;
