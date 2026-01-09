'use client';

import React, { forwardRef, type ReactNode, type HTMLAttributes, type AnchorHTMLAttributes } from 'react';

/**
 * NavigationMenu Component
 * 
 * Navigation menu for main site navigation.
 * 
 * RULES:
 * - NO borders (UI Law #1)
 * - ONLY rounded-xl (UI Law #2)
 * - ONLY mono colors (UI Law #3)
 * - ONLY Vazirmatn font (UI Law #4)
 * - Text from copy tokens only
 */

export interface NavigationMenuProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export interface NavigationMenuListProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
}

export interface NavigationMenuItemProps extends HTMLAttributes<HTMLLIElement> {
  children: ReactNode;
}

export interface NavigationMenuLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  active?: boolean;
}

// Main NavigationMenu container
export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={className}
        {...props}
      >
        {children}
      </nav>
    );
  }
);
NavigationMenu.displayName = 'NavigationMenu';

// NavigationMenuList - the list container
export const NavigationMenuList = forwardRef<HTMLUListElement, NavigationMenuListProps>(
  ({ children, className, style, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={className}
        style={{
          display: 'flex',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          gap: 'var(--spacing-sm)',
          ...style,
        }}
        {...props}
      >
        {children}
      </ul>
    );
  }
);
NavigationMenuList.displayName = 'NavigationMenuList';

// NavigationMenuItem - individual item
export const NavigationMenuItem = forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={className}
        {...props}
      >
        {children}
      </li>
    );
  }
);
NavigationMenuItem.displayName = 'NavigationMenuItem';

// NavigationMenuLink - the actual link
export const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ children, active = false, className, style, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
          textDecoration: 'none',
          borderRadius: 'var(--radius-lg)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = active ? 'var(--text-primary)' : 'var(--text-secondary)';
        }}
        {...props}
      >
        {children}
      </a>
    );
  }
);
NavigationMenuLink.displayName = 'NavigationMenuLink';
