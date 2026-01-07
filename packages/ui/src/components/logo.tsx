import React from 'react';

export interface LogoProps {
  /** Width & height of the logo */
  size?: number | string;
  /** Color variant - 'auto' uses currentColor (inherits from parent) */
  variant?: 'auto' | 'black' | 'white';
  /** Custom color (overrides variant) */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label - if provided, adds <title> for screen readers. If empty, logo is decorative (aria-hidden). */
  label?: string;
}

/**
 * Nasneh Logo Component
 * 
 * The official Nasneh brand mark. Uses identical SVG paths across all variants.
 * 
 * @example
 * // Auto color (inherits from parent text color) - RECOMMENDED
 * <Logo size={40} />
 * 
 * @example
 * // With accessible label (for important/standalone logos)
 * <Logo size={40} label="Nasneh" />
 * 
 * @example
 * // Black variant for light backgrounds
 * <Logo size={40} variant="black" />
 * 
 * @example
 * // White variant for dark backgrounds
 * <Logo size={40} variant="white" />
 * 
 * @example
 * // Custom color
 * <Logo size={40} color="#3B82F6" />
 */
export const Logo: React.FC<LogoProps> = ({
  size = 40,
  variant = 'auto',
  color,
  className = '',
  label,
}) => {
  // Determine fill color based on props
  // Using CSS variable references for black/white variants
  const fillColor = color 
    ? color 
    : variant === 'black' 
      ? 'var(--color-text-primary)' 
      : variant === 'white' 
        ? 'var(--color-text-inverse)' 
        : 'currentColor';

  // If no label, logo is decorative (aria-hidden)
  const isDecorative = !label;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      width={size}
      height={size}
      fill={fillColor}
      className={className}
      role={isDecorative ? 'presentation' : 'img'}
      aria-hidden={isDecorative ? 'true' : undefined}
      aria-label={!isDecorative ? label : undefined}
    >
      {label && <title>{label}</title>}
      <circle cx="257.26" cy="285.71" r="28.57" />
      <path d="M56.93,142.82c0-50.09,43.1-90.3,94.17-85.5,44.5,4.19,77.61,43.31,77.61,88.01v26.34c0,31.44,25.49,56.93,56.93,56.93h0v-85.79C285.64,64.27,221.37,0,142.82,0h0C64.27,0,0,64.27,0,142.82v200.04s0,0,0,0c31.44,0,56.93-25.49,56.93-56.93v-143.1Z" />
      <circle cx="142.74" cy="114.29" r="28.57" />
      <path d="M343.07,257.18c0,50.09-43.1,90.3-94.17,85.5-44.5-4.19-77.61-43.31-77.61-88.01v-26.34c0-31.44-25.49-56.93-56.93-56.93h0v85.79c0,78.55,64.27,142.82,142.82,142.82h0c78.55,0,142.82-64.27,142.82-142.82V57.14s0,0,0,0c-31.44,0-56.93,25.49-56.93,56.93v143.1Z" />
    </svg>
  );
};

export default Logo;
