'use client';

import React from 'react';

/**
 * Tab item
 */
export interface TabItem {
  /** Unique value */
  value: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Tabs Props
 */
export interface TabsProps {
  /** Tab items */
  tabs: TabItem[];
  /** Currently active tab */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Visual variant */
  variant?: 'underline' | 'pills';
  /** Full width tabs */
  fullWidth?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional Tailwind classes for layout */
  className?: string;
}

/**
 * Size classes mapping
 */
const sizeClasses = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
};

/**
 * Tabs Component
 * 
 * Navigation tabs for switching between views.
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  value,
  onChange,
  variant = 'underline',
  fullWidth = false,
  size = 'md',
  className = '',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledTabs = tabs.filter(tab => !tab.disabled);
    const currentEnabledIndex = enabledTabs.findIndex(tab => tab.value === tabs[index].value);
    
    let newIndex = -1;
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const direction = e.key === 'ArrowRight' ? 1 : -1;
      newIndex = (currentEnabledIndex + direction + enabledTabs.length) % enabledTabs.length;
    }
    
    if (newIndex !== -1 && enabledTabs[newIndex]) {
      onChange(enabledTabs[newIndex].value);
    }
  };

  return (
    <div
      role="tablist"
      className={`
        flex
        ${fullWidth ? 'w-full' : ''}
        ${variant === 'underline' ? 'gap-0' : 'gap-1'}
        ${className}
      `}
    >
      {tabs.map((tab, index) => {
        const isSelected = tab.value === value;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-disabled={isDisabled}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => !isDisabled && onChange(tab.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              ${fullWidth ? 'flex-1' : ''}
              ${sizeClasses[size]}
              flex items-center justify-center
              font-medium
              transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2
              ${variant === 'underline'
                ? `
                    relative
                    ${isSelected
                      ? 'text-[color:var(--text-primary)]'
                      : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
                    }
                  `
                : `
                    rounded-xl
                    ${isSelected
                      ? 'bg-[var(--bg-secondary)] text-[color:var(--text-primary)]'
                      : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                    }
                  `
              }
              ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            {tab.icon && (
              <span className="flex items-center">{tab.icon}</span>
            )}
            <span>{tab.label}</span>
            {variant === 'underline' && isSelected && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
