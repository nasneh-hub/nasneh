'use client';

import React from 'react';

/**
 * Toast variant
 */
export type ToastVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

/**
 * Toast position
 */
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

/**
 * Toast Props
 */
export interface ToastProps {
  /** Toast message */
  message: string;
  /** Optional title */
  title?: string;
  /** Toast variant */
  variant?: ToastVariant;
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Show close button */
  closable?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Additional Tailwind classes for layout */
  className?: string;
}

/**
 * Toast Container Props
 */
export interface ToastContainerProps {
  /** Position of toast container */
  position?: ToastPosition;
  /** Children toasts */
  children: React.ReactNode;
  /** Additional Tailwind classes for layout */
  className?: string;
}

/**
 * Variant icon mapping
 */
const variantIcons: Record<ToastVariant, React.ReactNode> = {
  default: null,
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

/**
 * Variant classes mapping
 */
const variantClasses: Record<ToastVariant, string> = {
  default: 'bg-[var(--bg-primary)] text-[color:var(--text-primary)]',
  success: 'bg-[var(--bg-primary)] text-[color:var(--color-success)]',
  warning: 'bg-[var(--bg-primary)] text-[color:var(--color-warning)]',
  error: 'bg-[var(--bg-primary)] text-[color:var(--color-danger)]',
  info: 'bg-[var(--bg-primary)] text-[color:var(--color-info)]',
};

/**
 * Position classes mapping
 */
const positionClasses: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

/**
 * Toast Component
 * 
 * Display temporary notifications to users.
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  title,
  variant = 'default',
  duration = 5000,
  closable = true,
  onClose,
  action,
  className = '',
}) => {
  React.useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icon = variantIcons[variant];

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3
        w-80 max-w-full
        p-4
        rounded-xl
        shadow-lg
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon && (
        <span className="shrink-0 mt-0.5">{icon}</span>
      )}
      
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold text-[color:var(--text-primary)] mb-1">{title}</p>
        )}
        <p className="text-sm text-[color:var(--text-secondary)]">{message}</p>
        
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 text-sm font-medium text-[color:var(--text-primary)] hover:underline focus:outline-none"
          >
            {action.label}
          </button>
        )}
      </div>

      {closable && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 rounded-xl text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Toast Container Component
 * 
 * Container for positioning toasts on the screen.
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  children,
  className = '',
}) => {
  return (
    <div
      className={`
        fixed z-50
        flex flex-col gap-2
        ${positionClasses[position]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Toast;
