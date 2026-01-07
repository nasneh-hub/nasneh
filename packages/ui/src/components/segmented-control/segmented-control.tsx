'use client';

import React from 'react';

/**
 * Segment option
 */
export interface SegmentOption {
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
 * SegmentedControl Props
 */
export interface SegmentedControlProps {
  /** Options to display */
  options: SegmentOption[];
  /** Currently selected value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Full width mode */
  fullWidth?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Additional Tailwind classes for layout */
  className?: string;
}

/**
 * Size classes mapping
 */
const sizeClasses = {
  sm: {
    container: 'h-8 p-0.5',
    segment: 'px-3 text-sm gap-1.5',
  },
  md: {
    container: 'h-10 p-1',
    segment: 'px-4 text-sm gap-2',
  },
  lg: {
    container: 'h-12 p-1',
    segment: 'px-5 text-base gap-2',
  },
};

/**
 * SegmentedControl Component
 * 
 * A segmented control for selecting between 2-6 options.
 */
export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  fullWidth = false,
  size = 'md',
  disabled = false,
  className = '',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledOptions = options.filter(opt => !opt.disabled);
    const currentEnabledIndex = enabledOptions.findIndex(opt => opt.value === options[index].value);
    
    let newIndex = -1;
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const direction = e.key === 'ArrowRight' ? 1 : -1;
      newIndex = (currentEnabledIndex + direction + enabledOptions.length) % enabledOptions.length;
    }
    
    if (newIndex !== -1 && enabledOptions[newIndex]) {
      onChange(enabledOptions[newIndex].value);
    }
  };

  return (
    <div
      role="tablist"
      className={`
        inline-flex
        ${fullWidth ? 'w-full' : ''}
        ${sizeClasses[size].container}
        bg-[var(--bg-secondary)]
        rounded-xl
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
        ${className}
      `}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const isDisabled = disabled || option.disabled;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-disabled={isDisabled}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => !isDisabled && onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              ${fullWidth ? 'flex-1' : ''}
              ${sizeClasses[size].segment}
              flex items-center justify-center
              rounded-xl
              font-medium
              transition-all duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2
              ${isSelected
                ? 'bg-[var(--bg-primary)] text-[color:var(--text-primary)] shadow-sm'
                : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
              }
              ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            {option.icon && (
              <span className="flex items-center">{option.icon}</span>
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
