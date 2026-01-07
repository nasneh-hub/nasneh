'use client';

import React from 'react';

/**
 * Select option
 */
export interface SelectOption {
  /** Unique value */
  value: string;
  /** Display label */
  label: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Select Props
 */
export interface SelectProps {
  /** Options to display */
  options: SelectOption[];
  /** Selected value(s) */
  value: string | string[];
  /** Change handler */
  onChange: (value: string | string[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Enable multi-select */
  multiple?: boolean;
  /** Enable search */
  searchable?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional Tailwind classes for layout */
  className?: string;
}

/**
 * Size classes mapping
 */
const sizeClasses = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-4 text-base',
};

/**
 * Select Component
 * 
 * Dropdown select for choosing from multiple options.
 */
export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  multiple = false,
  searchable = false,
  disabled = false,
  error = false,
  size = 'md',
  className = '',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search
  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  // Get selected labels
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const selectedLabels = selectedValues
    .map(v => options.find(opt => opt.value === v)?.label)
    .filter(Boolean)
    .join(', ');

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValue = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValue);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'Enter' && !isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full
          ${sizeClasses[size]}
          flex items-center justify-between gap-2
          bg-[var(--bg-primary)]
          rounded-xl
          ring-1 ring-inset
          ${error
            ? 'ring-[var(--color-danger)] focus:ring-[var(--color-danger)]'
            : 'ring-[var(--bg-tertiary)] focus:ring-[var(--color-focus)]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2
          transition-all duration-200
        `}
      >
        <span className={`truncate ${selectedLabels ? 'text-[color:var(--text-primary)]' : 'text-[color:var(--text-tertiary)]'}`}>
          {selectedLabels || placeholder}
        </span>
        <svg
          className={`w-4 h-4 shrink-0 text-[color:var(--text-tertiary)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--bg-primary)] rounded-xl shadow-lg ring-1 ring-[var(--bg-tertiary)] overflow-hidden">
          {/* Search input */}
          {searchable && (
            <div className="p-2">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full h-8 px-3 text-sm bg-[var(--bg-secondary)] rounded-xl text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
                autoFocus
              />
            </div>
          )}

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-[color:var(--text-tertiary)]">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full px-4 py-2
                      flex items-center justify-between gap-2
                      text-sm text-left
                      ${isSelected
                        ? 'bg-[var(--bg-secondary)] text-[color:var(--text-primary)]'
                        : 'text-[color:var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                      }
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      transition-colors
                    `}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 shrink-0 text-[color:var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;
