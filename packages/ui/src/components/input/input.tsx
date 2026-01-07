/**
 * Input Component
 * 
 * Text entry field for forms, search, and user input.
 * 
 * Source: docs/SPECS/COMPONENT_SPECS.md
 * 
 * RULES:
 * - NO borders (UI Law #1) - use background colors for states
 * - ONLY rounded-xl (UI Law #2)
 * - ONLY mono colors except semantic states (UI Law #3)
 * - ONLY Vazirmatn font (UI Law #4)
 * - Text from copy tokens only
 */
import { forwardRef, type ReactNode, type InputHTMLAttributes, useState } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size'> {
  /**
   * Input type
   * @default 'text'
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search';
  
  /**
   * Size of the input
   * @default 'md'
   */
  size?: 'sm' | 'md';
  
  /**
   * Error message to display below input
   * When set, input shows error state
   */
  error?: string;
  
  /**
   * Success message to display below input
   * When set, input shows success state
   */
  success?: string;
  
  /**
   * Icon to display as prefix (left side)
   */
  prefixIcon?: ReactNode;
  
  /**
   * Icon to display as suffix (right side)
   */
  suffixIcon?: ReactNode;
  
  /**
   * Layout-only className (flex, gap, margin, padding, width)
   * Color/style classes are blocked by ui-lint
   */
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      size = 'md',
      error,
      success,
      prefixIcon,
      suffixIcon,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    
    // Determine background based on state
    const getBackgroundClass = () => {
      if (error) return 'bg-[var(--input-bg-error)]';
      if (success) return 'bg-[var(--input-bg-success)]';
      return 'bg-[var(--input-bg)]';
    };
    
    // Size classes
    const sizeStyles = {
      sm: 'h-[var(--height-sm)] text-[length:var(--font-size-small)]',
      md: 'h-[var(--height-md)] text-[length:var(--font-size-body)]',
    };
    
    // Padding based on icons
    const getPaddingClass = () => {
      if (prefixIcon && (suffixIcon || isPassword)) return 'px-10';
      if (prefixIcon) return 'pl-10 pr-4';
      if (suffixIcon || isPassword) return 'pl-4 pr-10';
      return 'px-4';
    };
    
    // Base input styles
    const inputStyles = `
      w-full
      ${sizeStyles[size]}
      ${getBackgroundClass()}
      ${getPaddingClass()}
      rounded-xl
      font-[family-name:var(--font-family-primary)]
      text-[color:var(--text-primary)]
      placeholder:text-[color:var(--text-tertiary)]
      transition-all
      duration-150
      focus:outline-none
      focus:ring-[length:var(--ring-width)]
      focus:ring-[color:var(--ring-color)]
      focus:ring-offset-[length:var(--ring-offset)]
      disabled:opacity-50
      disabled:cursor-not-allowed
    `.replace(/\s+/g, ' ').trim();
    
    // Container styles
    const containerStyles = `relative ${className}`.trim();
    
    // Icon styles
    const iconBaseStyles = 'absolute top-1/2 -translate-y-1/2 text-[color:var(--text-tertiary)]';
    const prefixIconStyles = `${iconBaseStyles} left-3`;
    const suffixIconStyles = `${iconBaseStyles} right-3`;
    
    // Message styles
    const messageStyles = 'mt-1 text-[length:var(--font-size-small)] font-[family-name:var(--font-family-primary)]';
    const errorMessageStyles = `${messageStyles} text-[color:var(--color-danger)]`;
    const successMessageStyles = `${messageStyles} text-[color:var(--color-success)]`;
    
    // Password toggle button
    const PasswordToggle = () => (
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={`${suffixIconStyles} hover:text-[color:var(--text-secondary)] focus:outline-none`}
        tabIndex={-1}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? (
          // Eye off icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          // Eye icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    );
    
    return (
      <div className={containerStyles}>
        <div className="relative">
          {prefixIcon && (
            <span className={prefixIconStyles}>{prefixIcon}</span>
          )}
          
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={inputStyles}
            aria-invalid={!!error}
            aria-describedby={error ? 'input-error' : success ? 'input-success' : undefined}
            {...props}
          />
          
          {isPassword && !suffixIcon && <PasswordToggle />}
          {suffixIcon && !isPassword && (
            <span className={suffixIconStyles}>{suffixIcon}</span>
          )}
        </div>
        
        {error && (
          <p id="input-error" className={errorMessageStyles} role="alert">
            {error}
          </p>
        )}
        
        {success && !error && (
          <p id="input-success" className={successMessageStyles}>
            {success}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
