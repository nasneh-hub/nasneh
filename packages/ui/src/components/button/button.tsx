/**
 * Button Component
 * 
 * Primary interactive element for actions and CTAs.
 * 
 * Source: docs/SPECS/COMPONENT_SPECS.md
 * 
 * RULES:
 * - NO borders (UI Law #1)
 * - ONLY rounded-xl or rounded-full for iconOnly (UI Law #2)
 * - ONLY mono colors except semantic variants (UI Law #3)
 * - ONLY Vazirmatn font (UI Law #4)
 * - Text from copy tokens only
 */
import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /**
   * Visual variant of the button
   * @default 'default'
   */
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive';
  
  /**
   * Size of the button
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether the button is in loading state
   * Shows spinner and disables interaction
   * @default false
   */
  loading?: boolean;
  
  /**
   * Icon to display in the button
   */
  icon?: ReactNode;
  
  /**
   * Position of the icon
   * @default 'left'
   */
  iconPosition?: 'left' | 'right';
  
  /**
   * Whether this is an icon-only button
   * Uses rounded-full instead of rounded-xl
   * @default false
   */
  iconOnly?: boolean;
  
  /**
   * Whether the button should take full width
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Button content
   */
  children?: ReactNode;
  
  /**
   * Layout-only className (flex, gap, margin, padding, width)
   * Color/style classes are blocked by ui-lint
   */
  className?: string;
}

/**
 * Loading spinner component
 */
function Spinner({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  return (
    <svg
      className={`animate-spin ${sizeClasses[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      iconOnly = false,
      fullWidth = false,
      children,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    
    // Size classes using CSS variables
    const sizeStyles = {
      sm: 'h-[var(--height-sm)] px-3 text-[length:var(--font-size-small)]',
      md: 'h-[var(--height-md)] px-4 text-[length:var(--font-size-body)]',
      lg: 'h-[var(--height-lg)] px-6 text-[length:var(--font-size-h4)]',
    };
    
    // Icon-only size classes
    const iconOnlySizeStyles = {
      sm: 'h-[var(--height-sm)] w-[var(--height-sm)]',
      md: 'h-[var(--height-md)] w-[var(--height-md)]',
      lg: 'h-[var(--height-lg)] w-[var(--height-lg)]',
    };
    
    // Variant styles using CSS variables
    const variantStyles = {
      default: `
        bg-[var(--text-primary)] 
        text-[color:var(--bg-primary)] 
        hover:opacity-90 
        active:opacity-80
      `,
      secondary: `
        bg-[var(--bg-tertiary)] 
        text-[color:var(--text-primary)] 
        hover:bg-[var(--bg-hover)]
      `,
      ghost: `
        bg-transparent 
        text-[color:var(--text-primary)] 
        hover:bg-[var(--bg-hover)]
      `,
      destructive: `
        bg-[var(--color-danger)] 
        text-white 
        hover:opacity-90 
        active:opacity-80
      `,
    };
    
    // Disabled styles
    const disabledStyles = isDisabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer active:scale-[0.98]';
    
    // Border radius - rounded-xl for normal, rounded-full for iconOnly
    const radiusStyle = iconOnly
      ? 'rounded-full'
      : 'rounded-xl';
    
    // Width style
    const widthStyle = fullWidth ? 'w-full' : '';
    
    // Base styles
    const baseStyles = `
      inline-flex 
      items-center 
      justify-center 
      gap-2
      font-[family-name:var(--font-family-primary)]
      font-[number:var(--font-weight-medium)]
      transition-all
      duration-150
      focus:outline-none
      focus:ring-[length:var(--ring-width)]
      focus:ring-[color:var(--ring-color)]
      focus:ring-offset-[length:var(--ring-offset)]
    `;
    
    // Combine all classes
    const buttonClasses = [
      baseStyles,
      iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],
      variantStyles[variant],
      disabledStyles,
      radiusStyle,
      widthStyle,
      className,
    ]
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={buttonClasses}
        {...props}
      >
        {loading ? (
          <Spinner size={size} />
        ) : (
          <>
            {icon && iconPosition === 'left' && !iconOnly && (
              <span className="flex-shrink-0">{icon}</span>
            )}
            {iconOnly ? icon : children}
            {icon && iconPosition === 'right' && !iconOnly && (
              <span className="flex-shrink-0">{icon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
