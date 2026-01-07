/**
 * Dialog Component
 * 
 * Modal overlay for confirmations, forms, and important messages.
 * 
 * Source: docs/SPECS/COMPONENT_SPECS.md
 * 
 * RULES:
 * - NO borders (UI Law #1)
 * - ONLY rounded-xl (UI Law #2)
 * - ONLY mono colors (UI Law #3)
 * - ONLY Vazirmatn font (UI Law #4)
 * - Text from copy tokens only
 */
import {
  forwardRef,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
} from 'react';

export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title'> {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Close handler
   */
  onClose: () => void;
  
  /**
   * Dialog title (from copy tokens)
   */
  title: string;
  
  /**
   * Dialog content
   */
  children: ReactNode;
  
  /**
   * Optional footer with actions
   */
  footer?: ReactNode;
  
  /**
   * Whether clicking backdrop closes dialog
   * @default true
   */
  closeOnBackdropClick?: boolean;
  
  /**
   * Whether pressing Escape closes dialog
   * @default true
   */
  closeOnEscape?: boolean;
  
  /**
   * Variant for destructive actions
   * @default 'default'
   */
  variant?: 'default' | 'destructive';
  
  /**
   * Layout-only className (flex, gap, margin, padding, width)
   * Color/style classes are blocked by ui-lint
   */
  className?: string;
}

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      open,
      onClose,
      title,
      children,
      footer,
      closeOnBackdropClick = true,
      closeOnEscape = true,
      variant = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    
    // Handle escape key
    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape') {
          onClose();
        }
      },
      [closeOnEscape, onClose]
    );
    
    // Handle backdrop click
    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdropClick && event.target === event.currentTarget) {
        onClose();
      }
    };
    
    // Lock body scroll and trap focus when open
    useEffect(() => {
      if (open) {
        // Store current active element
        previousActiveElement.current = document.activeElement as HTMLElement;
        
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        
        // Add escape key listener
        document.addEventListener('keydown', handleKeyDown);
        
        // Focus the dialog
        setTimeout(() => {
          dialogRef.current?.focus();
        }, 0);
      } else {
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Remove escape key listener
        document.removeEventListener('keydown', handleKeyDown);
        
        // Restore focus to previous element
        previousActiveElement.current?.focus();
      }
      
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [open, handleKeyDown]);
    
    // Don't render if not open
    if (!open) return null;
    
    // Backdrop styles
    const backdropStyles = `
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/50
      backdrop-blur-sm
      p-4
    `.replace(/\s+/g, ' ').trim();
    
    // Dialog styles
    const dialogStyles = `
      relative
      w-full
      max-w-[600px]
      max-h-[90vh]
      overflow-auto
      bg-[var(--bg-primary)]
      rounded-xl
      shadow-[var(--shadow-lg)]
      font-[family-name:var(--font-family-primary)]
      ${className}
    `.replace(/\s+/g, ' ').trim();
    
    // Title styles
    const titleStyles = `
      text-[length:var(--font-size-h3)]
      font-[number:var(--font-weight-semibold)]
      text-[color:var(--text-primary)]
      pr-8
    `.replace(/\s+/g, ' ').trim();
    
    // Close button styles
    const closeButtonStyles = `
      absolute
      top-4
      right-4
      p-2
      rounded-xl
      text-[color:var(--text-secondary)]
      hover:bg-[var(--bg-hover)]
      hover:text-[color:var(--text-primary)]
      transition-colors
      focus:outline-none
      focus:ring-[length:var(--ring-width)]
      focus:ring-[color:var(--ring-color)]
    `.replace(/\s+/g, ' ').trim();
    
    return (
      <div
        className={backdropStyles}
        onClick={handleBackdropClick}
        role="presentation"
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          tabIndex={-1}
          className={dialogStyles}
          {...props}
        >
          {/* Header */}
          <div className="p-6 pb-0">
            <h2 id="dialog-title" className={titleStyles}>
              {title}
            </h2>
            
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className={closeButtonStyles}
              aria-label="Close dialog"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 text-[color:var(--text-secondary)]">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="p-6 pt-0 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Dialog.displayName = 'Dialog';
