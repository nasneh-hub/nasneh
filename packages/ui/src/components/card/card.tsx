/**
 * Card Component
 * 
 * Content container for grouping related information.
 * 
 * Source: docs/SPECS/COMPONENT_SPECS.md
 * 
 * RULES:
 * - NO borders (UI Law #1) - use shadow for depth
 * - ONLY rounded-xl (UI Law #2)
 * - ONLY mono colors (UI Law #3)
 * - ONLY Vazirmatn font (UI Law #4)
 */
import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /**
   * Card variant
   * @default 'default'
   */
  variant?: 'default' | 'elevated' | 'flat';
  
  /**
   * Padding size
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  
  /**
   * Whether the card is interactive (clickable)
   * @default false
   */
  interactive?: boolean;
  
  /**
   * Card content
   */
  children: ReactNode;
  
  /**
   * Layout-only className (flex, gap, margin, padding, width)
   * Color/style classes are blocked by ui-lint
   */
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      interactive = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variantStyles = {
      default: 'bg-[var(--bg-tertiary)] shadow-[var(--shadow-sm)]',
      elevated: 'bg-[var(--bg-primary)] shadow-[var(--shadow-md)]',
      flat: 'bg-[var(--bg-tertiary)]',
    };
    
    // Padding styles
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };
    
    // Interactive styles
    const interactiveStyles = interactive
      ? 'cursor-pointer hover:shadow-[var(--shadow-md)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-150'
      : '';
    
    // Base styles
    const baseStyles = `
      rounded-xl
      font-[family-name:var(--font-family-primary)]
    `.replace(/\s+/g, ' ').trim();
    
    // Combine all classes
    const cardClasses = [
      baseStyles,
      variantStyles[variant],
      paddingStyles[padding],
      interactiveStyles,
      className,
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return (
      <div
        ref={ref}
        className={cardClasses}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header Component
 */
export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  children: ReactNode;
  className?: string;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mb-4 ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * Card Title Component
 */
export interface CardTitleProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'className'> {
  children: ReactNode;
  className?: string;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`
          text-[length:var(--font-size-h3)]
          font-[number:var(--font-weight-semibold)]
          text-[color:var(--text-primary)]
          font-[family-name:var(--font-family-primary)]
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

/**
 * Card Description Component
 */
export interface CardDescriptionProps extends Omit<HTMLAttributes<HTMLParagraphElement>, 'className'> {
  children: ReactNode;
  className?: string;
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`
          text-[length:var(--font-size-small)]
          text-[color:var(--text-secondary)]
          font-[family-name:var(--font-family-primary)]
          mt-1
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

/**
 * Card Content Component
 */
export interface CardContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  children: ReactNode;
  className?: string;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

/**
 * Card Footer Component
 */
export interface CardFooterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  children: ReactNode;
  className?: string;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mt-4 flex items-center gap-2 ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
