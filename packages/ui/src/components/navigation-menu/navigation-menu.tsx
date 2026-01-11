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
        className={`flex list-none m-0 p-0 gap-[var(--spacing-sm)] ${className || ''}`}
        style={style}
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
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <a
        ref={ref}
        className={`
          flex items-center
          px-[var(--spacing-md)] py-[var(--spacing-sm)]
          text-[length:var(--font-size-sm)]
          font-[var(--font-weight-medium)]
          no-underline
          rounded-[var(--radius)]
          transition-all duration-200 ease-in-out
          cursor-pointer
          ${isHovered 
            ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]' 
            : active 
              ? 'bg-transparent text-[var(--text-primary)]' 
              : 'bg-transparent text-[var(--text-secondary)]'
          }
          ${className || ''}
        `}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </a>
    );
  }
);
NavigationMenuLink.displayName = 'NavigationMenuLink';
