'use client';

import React, { useEffect, useState, useCallback, createContext, useContext, useId } from 'react';

/**
 * Toast Variant
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast Action
 */
export interface ToastAction {
  label: string;
  onClick: () => void;
}

/**
 * Toast Props
 */
export interface ToastProps {
  /**
   * Unique toast ID
   */
  id: string;
  
  /**
   * Toast variant
   */
  variant: ToastVariant;
  
  /**
   * Toast message (from copy tokens)
   */
  message: string;
  
  /**
   * Optional action button
   */
  action?: ToastAction;
  
  /**
   * Auto-dismiss duration in milliseconds
   * @default 5000
   */
  duration?: number;
  
  /**
   * Whether the toast can be manually closed
   * @default true
   */
  closable?: boolean;
  
  /**
   * Close handler
   */
  onClose?: () => void;
}

/**
 * Variant configurations
 */
const variantConfig: Record<ToastVariant, { bg: string; text: string; icon: string }> = {
  success: {
    bg: 'var(--color-success)',
    text: 'var(--color-text-inverse)',
    icon: '✓',
  },
  error: {
    bg: 'var(--color-danger)',
    text: 'var(--color-text-inverse)',
    icon: '✕',
  },
  warning: {
    bg: 'var(--color-warning)',
    text: 'var(--text-primary)',
    icon: '⚠',
  },
  info: {
    bg: 'var(--color-info)',
    text: 'var(--color-text-inverse)',
    icon: 'ℹ',
  },
};

/**
 * Single Toast Component
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  variant,
  message,
  action,
  duration = 5000,
  closable = true,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const config = variantConfig[variant];
  
  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);
  
  // Auto-dismiss
  useEffect(() => {
    if (duration && !isPaused) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, isPaused]);
  
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 150);
  }, [onClose]);
  
  // Container styles
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-md)',
    minWidth: 300,
    maxWidth: 400,
    padding: 'var(--spacing-lg)',
    backgroundColor: config.bg,
    borderRadius: 'var(--radius-standard)',
    boxShadow: 'var(--shadow-lg)',
    fontFamily: 'var(--font-family-primary)',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
    transition: 'all 150ms ease',
    pointerEvents: 'auto',
  };
  
  // Icon styles
  const iconStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    fontSize: 14,
    fontWeight: 'var(--font-weight-bold)' as any,
    color: config.text,
    flexShrink: 0,
  };
  
  // Content styles
  const contentStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  };
  
  // Message styles
  const messageStyles: React.CSSProperties = {
    fontSize: 'var(--font-size-small)',
    fontWeight: 'var(--font-weight-medium)' as any,
    color: config.text,
    lineHeight: 1.5,
  };
  
  // Action button styles
  const actionStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    fontSize: 'var(--font-size-caption)',
    fontWeight: 'var(--font-weight-semibold)' as any,
    fontFamily: 'var(--font-family-primary)',
    color: config.text,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 'calc(var(--radius-standard) / 2)',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  };
  
  // Close button styles
  const closeStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    fontSize: 16,
    color: config.text,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    opacity: 0.7,
    transition: 'opacity 150ms ease',
    flexShrink: 0,
    fontFamily: 'var(--font-family-primary)',
  };
  
  return (
    <div
      role="alert"
      aria-live="polite"
      style={containerStyles}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <span style={iconStyles}>{config.icon}</span>
      
      <div style={contentStyles}>
        <span style={messageStyles}>{message}</span>
        
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            style={actionStyles}
          >
            {action.label}
          </button>
        )}
      </div>
      
      {closable && (
        <button
          type="button"
          onClick={handleClose}
          style={closeStyles}
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
};

/**
 * Toast Container Component
 */
export interface ToastContainerProps {
  /**
   * Maximum number of toasts to show
   * @default 3
   */
  maxToasts?: number;
  
  /**
   * Position of the toast container
   * @default 'top-right'
   */
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

/**
 * Toast Context
 */
interface ToastContextValue {
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Toast Provider
 */
export const ToastProvider: React.FC<{ children: React.ReactNode } & ToastContainerProps> = ({
  children,
  maxToasts = 3,
  position = 'top-right',
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  
  const addToast = useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts(prev => {
      const newToasts = [...prev, { ...toast, id }];
      // Remove oldest if exceeds max
      if (newToasts.length > maxToasts) {
        return newToasts.slice(-maxToasts);
      }
      return newToasts;
    });
    
    return id;
  }, [maxToasts]);
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: 'var(--spacing-lg)', right: 'var(--spacing-lg)' },
    'top-center': { top: 'var(--spacing-lg)', left: '50%', transform: 'translateX(-50%)' },
    'top-left': { top: 'var(--spacing-lg)', left: 'var(--spacing-lg)' },
    'bottom-right': { bottom: 'var(--spacing-lg)', right: 'var(--spacing-lg)' },
    'bottom-center': { bottom: 'var(--spacing-lg)', left: '50%', transform: 'translateX(-50%)' },
    'bottom-left': { bottom: 'var(--spacing-lg)', left: 'var(--spacing-lg)' },
  };
  
  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
    pointerEvents: 'none',
    ...positionStyles[position],
  };
  
  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div style={containerStyles}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * useToast hook
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return {
    success: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'variant' | 'message' | 'onClose'>>) =>
      context.addToast({ variant: 'success', message, ...options }),
    error: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'variant' | 'message' | 'onClose'>>) =>
      context.addToast({ variant: 'error', message, ...options }),
    warning: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'variant' | 'message' | 'onClose'>>) =>
      context.addToast({ variant: 'warning', message, ...options }),
    info: (message: string, options?: Partial<Omit<ToastProps, 'id' | 'variant' | 'message' | 'onClose'>>) =>
      context.addToast({ variant: 'info', message, ...options }),
    dismiss: context.removeToast,
  };
};

export default Toast;
