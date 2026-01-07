/**
 * Badge Component
 * 
 * Status indicators and labels for categorization.
 * 
 * Source: docs/SPECS/COMPONENT_SPECS.md
 * 
 * RULES:
 * - NO borders (UI Law #1)
 * - ONLY rounded-xl (UI Law #2) - exception: dot variant uses rounded-full
 * - Semantic colors ONLY for status (UI Law #3)
 * - ONLY Vazirmatn font (UI Law #4)
 * - Text from copy tokens only
 * - Max text length: 20 characters
 */
import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {
  /**
   * Badge variant - determines color
   * @default 'default'
   */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  
  /**
   * Badge size
   * @default 'md'
   */
  size?: 'sm' | 'md';
  
  /**
   * Whether to show as a dot (no text)
   * @default false
   */
  dot?: boolean;
  
  /**
   * Badge content (from copy tokens)
   */
  children?: ReactNode;
  
  /**
   * Layout-only className (flex, gap, margin, padding, width)
   * Color/style classes are blocked by ui-lint
   */
  className?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      dot = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    // Variant styles - semantic colors for status
    const variantStyles = {
      default: 'bg-[var(--bg-tertiary)] text-[color:var(--text-primary)]',
      success: 'bg-[var(--color-success)] text-[color:var(--color-text-inverse)]',
      warning: 'bg-[var(--color-warning)] text-[color:var(--text-primary)]',
      danger: 'bg-[var(--color-danger)] text-[color:var(--color-text-inverse)]',
      info: 'bg-[var(--color-info)] text-[color:var(--color-text-inverse)]',
    };
    
    // Size styles
    const sizeStyles = {
      sm: 'h-5 px-2 text-[length:var(--font-size-caption)]',
      md: 'h-6 px-2.5 text-[length:var(--font-size-small)]',
    };
    
    // Dot styles (8px circle)
    const dotStyles = 'h-2 w-2 p-0';
    
    // Base styles
    const baseStyles = `
      inline-flex
      items-center
      justify-center
      font-[family-name:var(--font-family-primary)]
      font-[number:var(--font-weight-medium)]
      ${dot ? 'rounded-full' : 'rounded-xl'}
    `.replace(/\s+/g, ' ').trim();
    
    // Combine all classes
    const badgeClasses = [
      baseStyles,
      variantStyles[variant],
      dot ? dotStyles : sizeStyles[size],
      className,
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return (
      <span
        ref={ref}
        className={badgeClasses}
        {...props}
      >
        {!dot && children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
