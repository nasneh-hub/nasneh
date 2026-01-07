/**
 * Skeleton Component
 * 
 * Loading placeholder that matches component dimensions during data fetch.
 * 
 * Source: docs/SPECS/COMPONENT_SPECS.md
 * 
 * RULES:
 * - NO borders (UI Law #1)
 * - ONLY rounded-xl (UI Law #2) - exception: circle variant uses rounded-full
 * - ONLY mono colors (UI Law #3)
 * - NO inline styles
 */
import { forwardRef, type HTMLAttributes } from 'react';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /**
   * Skeleton variant
   * @default 'text'
   */
  variant?: 'text' | 'circle' | 'rectangle' | 'card';
  
  /**
   * Width - use Tailwind classes like w-full, w-1/2, w-[200px]
   * @default varies by variant
   */
  width?: 'full' | '3/4' | '1/2' | '1/4' | 'auto';
  
  /**
   * Height - use predefined sizes
   * @default varies by variant
   */
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Number of lines (for text variant)
   * @default 1
   */
  lines?: number;
  
  /**
   * Whether to animate
   * @default true
   */
  animate?: boolean;
  
  /**
   * Layout-only className (flex, gap, margin, padding, width)
   * Color/style classes are blocked by ui-lint
   */
  className?: string;
}

/**
 * Get width class based on prop
 */
function getWidthClass(width?: 'full' | '3/4' | '1/2' | '1/4' | 'auto', variant?: string): string {
  if (width) {
    const widthMap = {
      'full': 'w-full',
      '3/4': 'w-3/4',
      '1/2': 'w-1/2',
      '1/4': 'w-1/4',
      'auto': 'w-auto',
    };
    return widthMap[width];
  }
  // Default widths by variant
  switch (variant) {
    case 'circle':
      return 'w-10';
    default:
      return 'w-full';
  }
}

/**
 * Get height class based on prop
 */
function getHeightClass(height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl', variant?: string): string {
  if (height) {
    const heightMap = {
      'xs': 'h-2',
      'sm': 'h-4',
      'md': 'h-6',
      'lg': 'h-12',
      'xl': 'h-24',
    };
    return heightMap[height];
  }
  // Default heights by variant
  switch (variant) {
    case 'text':
      return 'h-4';
    case 'circle':
      return 'h-10';
    case 'rectangle':
      return 'h-32';
    case 'card':
      return 'h-48';
    default:
      return 'h-4';
  }
}

/**
 * Single skeleton line component
 */
function SkeletonLine({
  width,
  height,
  variant,
  animate,
  className = '',
}: {
  width?: 'full' | '3/4' | '1/2' | '1/4' | 'auto';
  height?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant: 'text' | 'circle' | 'rectangle' | 'card';
  animate: boolean;
  className?: string;
}) {
  // Border radius based on variant
  const radiusClass = variant === 'circle' ? 'rounded-full' : 'rounded-xl';
  
  // Animation class
  const animationClass = animate ? 'animate-pulse' : '';
  
  // Width and height classes
  const widthClass = getWidthClass(width, variant);
  const heightClass = getHeightClass(height, variant);
  
  // Base styles
  const baseStyles = `
    bg-[var(--bg-tertiary)]
    ${widthClass}
    ${heightClass}
    ${radiusClass}
    ${animationClass}
    ${className}
  `.replace(/\s+/g, ' ').trim();
  
  return (
    <div
      className={baseStyles}
      aria-hidden="true"
    />
  );
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      lines = 1,
      animate = true,
      className = '',
      ...props
    },
    ref
  ) => {
    // For text variant with multiple lines
    if (variant === 'text' && lines > 1) {
      return (
        <div
          ref={ref}
          className={`flex flex-col gap-2 ${className}`.trim()}
          role="status"
          aria-busy="true"
          aria-label="Loading"
          {...props}
        >
          {Array.from({ length: lines }).map((_, index) => (
            <SkeletonLine
              key={index}
              variant="text"
              width={index === lines - 1 ? '3/4' : 'full'} // Last line is shorter
              height={height}
              animate={animate}
            />
          ))}
        </div>
      );
    }
    
    // Card variant includes padding and shadow
    if (variant === 'card') {
      return (
        <div
          ref={ref}
          className={`
            bg-[var(--bg-tertiary)]
            rounded-xl
            shadow-[var(--shadow-sm)]
            p-4
            w-full
            ${animate ? 'animate-pulse' : ''}
            ${className}
          `.replace(/\s+/g, ' ').trim()}
          role="status"
          aria-busy="true"
          aria-label="Loading"
          {...props}
        >
          {/* Card skeleton content */}
          <div className="flex flex-col gap-3">
            <SkeletonLine variant="rectangle" height="lg" animate={animate} />
            <SkeletonLine variant="text" width="1/2" animate={animate} />
            <SkeletonLine variant="text" width="3/4" animate={animate} />
            <SkeletonLine variant="text" width="1/4" animate={animate} />
          </div>
        </div>
      );
    }
    
    // Single skeleton
    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        aria-label="Loading"
        className={className}
        {...props}
      >
        <SkeletonLine
          variant={variant}
          width={width}
          height={height}
          animate={animate}
        />
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';
