'use client';

import React, { forwardRef, useEffect, useRef, useState, type ReactNode, type HTMLAttributes } from 'react';

/**
 * DropdownMenu Component
 * 
 * Dropdown menu for actions and navigation.
 * 
 * RULES:
 * - NO borders (UI Law #1)
 * - ONLY rounded-xl (UI Law #2)
 * - ONLY mono colors (UI Law #3)
 * - ONLY Vazirmatn font (UI Law #4)
 * - Text from copy tokens only
 */

export interface DropdownMenuProps {
  children: ReactNode;
}

export interface DropdownMenuTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  asChild?: boolean;
}

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export interface DropdownMenuItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  disabled?: boolean;
}

export interface DropdownMenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

// Context for managing dropdown state
const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
}>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
});

export const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>{children}</div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, asChild, ...props }, ref) => {
    const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext);

    const handleClick = () => {
      setOpen(!open);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref: (node: HTMLElement) => {
          (triggerRef as React.MutableRefObject<HTMLElement>).current = node;
          if (typeof ref === 'function') ref(node as any);
          else if (ref) (ref as React.MutableRefObject<HTMLElement>).current = node as any;
        },
        onClick: handleClick,
      });
    }

    return (
      <button
        ref={(node) => {
          (triggerRef as React.MutableRefObject<HTMLElement>).current = node as HTMLElement;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, align = 'end', sideOffset = 8, ...props }, ref) => {
    const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext);
    const contentRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
      if (!open) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          contentRef.current &&
          !contentRef.current.contains(event.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, setOpen, triggerRef]);

    // Close on Escape
    useEffect(() => {
      if (!open) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false);
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, setOpen]);

    if (!open) return null;

    const alignmentStyles = {
      start: { left: 0 },
      center: { left: '50%', transform: 'translateX(-50%)' },
      end: { right: 0 },
    };

    return (
      <div
        ref={(node) => {
          (contentRef as React.MutableRefObject<HTMLDivElement>).current = node as HTMLDivElement;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        style={{
          position: 'absolute',
          top: `calc(100% + ${sideOffset}px)`,
          ...alignmentStyles[align],
          zIndex: 50,
          minWidth: '200px',
        }}
        className="rounded-xl bg-[var(--bg-primary)] shadow-[var(--shadow-lg)] p-[var(--spacing-sm)]"
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ children, disabled, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      onClick?.(e);
      setOpen(false);
    };

    return (
      <div
        ref={ref}
        onClick={handleClick}
        className={`
          flex items-center
          px-[var(--spacing-md)] py-[var(--spacing-sm)]
          text-[length:var(--font-size-base)]
          rounded-xl
          transition-colors duration-200
          hover:bg-[var(--bg-hover)]
          ${disabled 
            ? 'text-[var(--text-tertiary)] cursor-not-allowed opacity-50' 
            : 'text-[var(--text-primary)] cursor-pointer'
          }
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  (props, ref) => {
    return (
      <div
        ref={ref}
        className="h-px my-[var(--spacing-xs)] bg-[var(--border-primary)]"
        {...props}
      />
    );
  }
);

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
