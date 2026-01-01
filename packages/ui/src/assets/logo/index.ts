/**
 * Nasneh Logo Assets
 * 
 * All SVG paths are IDENTICAL across variants - only fill color differs.
 * Use the Logo component for React applications.
 * Use these paths for static assets or non-React contexts.
 */

export const LOGO_PATHS = {
  /** Primary logo - uses currentColor (adapts to parent text color) */
  mono: './nasneh-logo.svg',
  /** Black logo - for light backgrounds (marketing) */
  black: './nasneh-logo-black.svg',
  /** White logo - for dark backgrounds (marketing) */
  white: './nasneh-logo-white.svg',
} as const;

export type LogoVariant = keyof typeof LOGO_PATHS;
