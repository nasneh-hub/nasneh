'use client';

import React, { useState, useRef, useEffect, useCallback, useId, KeyboardEvent, ReactNode } from 'react';

/**
 * Select Option
 */
export interface SelectOption {
  /**
   * Option value
   */
  value: string;
  
  /**
   * Option label (from copy tokens)
   */
  label: string;
  
  /**
   * Optional icon
   */
  icon?: ReactNode;
  
  /**
   * Whether the option is disabled
   * @default false
   */
  disabled?: boolean;
}

/**
 * Select Props
 */
export interface SelectProps {
  /**
   * Available options (7+ recommended)
   */
  options: SelectOption[];
  
  /**
   * Currently selected value(s)
   */
  value: string | string[];
  
  /**
   * Change handler
   */
  onChange: (value: string | string[]) => void;
  
  /**
   * Placeholder text (from copy tokens)
   */
  placeholder?: string;
  
  /**
   * Whether the select is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether search is enabled
   * Auto-enabled when 10+ options
   * @default false
   */
  searchable?: boolean;
  
  /**
   * Search placeholder (from copy tokens)
   */
  searchPlaceholder?: string;
  
  /**
   * Empty state message (from copy tokens)
   */
  emptyMessage?: string;
  
  /**
   * Variant
   * @default 'single'
   */
  variant?: 'single' | 'multiple';
  
  /**
   * Accessible label
   */
  'aria-label'?: string;
}

/**
 * Chevron Icon
 */
const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={{
      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 150ms ease',
    }}
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Checkmark Icon
 */
const CheckIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M3 8L6.5 11.5L13 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Select Component
 * 
 * Dropdown selection for 7 or more options with search support.
 * 
 * @example
 * ```tsx
 * import { Select } from '@nasneh/ui';
 * import { ar } from '@nasneh/ui/copy';
 * 
 * <Select
 *   options={categories}
 *   value={selected}
 *   onChange={setSelected}
 *   placeholder={ar.ui.selectCategory}
 * />
 * ```
 */
export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  searchable: searchableProp = false,
  searchPlaceholder,
  emptyMessage,
  variant = 'single',
  'aria-label': ariaLabel,
}) => {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  
  // Auto-enable search for 10+ options
  const searchable = searchableProp || options.length >= 10;
  
  // Filter options based on search
  const filteredOptions = searchQuery
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;
  
  // Get selected labels
  const getSelectedLabel = (): string => {
    if (Array.isArray(value)) {
      if (value.length === 0) return placeholder || '';
      const labels = value
        .map(v => options.find(opt => opt.value === v)?.label)
        .filter(Boolean);
      return labels.join(', ');
    }
    return options.find(opt => opt.value === value)?.label || placeholder || '';
  };
  
  // Check if option is selected
  const isSelected = (optionValue: string): boolean => {
    if (Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };
  
  // Handle option click
  const handleOptionClick = (option: SelectOption) => {
    if (option.disabled) return;
    
    if (variant === 'multiple' && Array.isArray(value)) {
      const newValue = isSelected(option.value)
        ? value.filter(v => v !== option.value)
        : [...value, option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
    
    setSearchQuery('');
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'Tab':
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  };
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);
  
  // Reset highlighted index when options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchQuery]);
  
  // Styles
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    fontFamily: 'var(--font-family-primary)',
  };
  
  const triggerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 'var(--height-md)',
    padding: '0 var(--spacing-lg)',
    fontSize: 'var(--font-size-body)',
    fontFamily: 'var(--font-family-primary)',
    color: value && (Array.isArray(value) ? value.length > 0 : value) 
      ? 'var(--text-primary)' 
      : 'var(--text-tertiary)',
    backgroundColor: 'var(--input-bg)',
    borderRadius: 'var(--radius-standard)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 150ms ease',
    boxShadow: isOpen ? '0 0 0 2px var(--text-primary)' : 'none',
  };
  
  const dropdownStyles: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + var(--spacing-xs))',
    left: 0,
    right: 0,
    maxHeight: 300,
    overflowY: 'auto',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-standard)',
    boxShadow: 'var(--shadow-md)',
    zIndex: 1000,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transform: isOpen ? 'translateY(0)' : 'translateY(-8px)',
    transition: 'all 150ms ease',
  };
  
  const searchStyles: React.CSSProperties = {
    width: '100%',
    padding: 'var(--spacing-md) var(--spacing-lg)',
    fontSize: 'var(--font-size-small)',
    fontFamily: 'var(--font-family-primary)',
    color: 'var(--text-primary)',
    backgroundColor: 'transparent',
    borderBottom: '1px solid var(--bg-tertiary)',
    outline: 'none',
  };
  
  const getOptionStyles = (index: number, option: SelectOption): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-md) var(--spacing-lg)',
    fontSize: 'var(--font-size-body)',
    color: option.disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
    backgroundColor: isSelected(option.value)
      ? 'var(--bg-tertiary)'
      : (highlightedIndex === index || hoveredIndex === index)
        ? 'var(--bg-hover)'
        : 'transparent',
    cursor: option.disabled ? 'not-allowed' : 'pointer',
    opacity: option.disabled ? 0.5 : 1,
    transition: 'background-color 150ms ease',
  });
  
  const emptyStyles: React.CSSProperties = {
    padding: 'var(--spacing-lg)',
    fontSize: 'var(--font-size-small)',
    color: 'var(--text-tertiary)',
    textAlign: 'center',
  };
  
  return (
    <div ref={containerRef} style={containerStyles}>
      <button
        type="button"
        id={`${id}-trigger`}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        style={triggerStyles}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getSelectedLabel()}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>
      
      <div
        id={`${id}-listbox`}
        role="listbox"
        aria-multiselectable={variant === 'multiple'}
        style={dropdownStyles}
      >
        {searchable && (
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            style={searchStyles}
            aria-label="Search options"
          />
        )}
        
        {filteredOptions.length === 0 ? (
          <div style={emptyStyles}>
            {emptyMessage || 'No options found'}
          </div>
        ) : (
          filteredOptions.map((option, index) => (
            <div
              key={option.value}
              role="option"
              aria-selected={isSelected(option.value)}
              aria-disabled={option.disabled}
              onClick={() => handleOptionClick(option)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(-1)}
              style={getOptionStyles(index, option)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                {option.icon && <span>{option.icon}</span>}
                <span>{option.label}</span>
              </span>
              {isSelected(option.value) && (
                <span style={{ color: 'var(--text-primary)' }}>
                  <CheckIcon />
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Select;
