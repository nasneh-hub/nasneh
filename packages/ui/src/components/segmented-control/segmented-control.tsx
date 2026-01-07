'use client';

import React, { useId, useCallback, KeyboardEvent, ReactNode } from 'react';

/**
 * SegmentedControl Option
 */
export interface SegmentedControlOption {
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
}

/**
 * SegmentedControl Props
 */
export interface SegmentedControlProps {
  /**
   * Available options (2-6 only)
   */
  options: SegmentedControlOption[];
  
  /**
   * Currently selected value
   */
  value: string;
  
  /**
   * Change handler
   */
  onChange: (value: string) => void;
  
  /**
   * Whether the control is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Full width on mobile
   * @default true
   */
  fullWidth?: boolean;
  
  /**
   * Accessible label for the control
   */
  'aria-label'?: string;
}

/**
 * SegmentedControl Component
 * 
 * Compact selection control for 2-6 mutually exclusive options.
 * 
 * @example
 * ```tsx
 * import { SegmentedControl } from '@nasneh/ui';
 * import { ar } from '@nasneh/ui/copy';
 * 
 * <SegmentedControl
 *   options={[
 *     { value: 'all', label: ar.ui.all },
 *     { value: 'active', label: ar.status.active },
 *   ]}
 *   value={filter}
 *   onChange={setFilter}
 * />
 * ```
 */
export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  fullWidth = true,
  'aria-label': ariaLabel,
}) => {
  const groupId = useId();
  
  // Validate options count (2-6)
  if (options.length < 2 || options.length > 6) {
    console.warn('SegmentedControl: options should be between 2 and 6. Use Select for 7+ options.');
  }
  
  const currentIndex = options.findIndex(opt => opt.value === value);
  
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = options.length - 1;
        break;
      default:
        return;
    }
    
    if (newIndex !== currentIndex) {
      onChange(options[newIndex].value);
    }
  }, [currentIndex, disabled, onChange, options]);
  
  // Container styles
  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: 'var(--spacing-xs)',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-standard)',
    gap: 'var(--spacing-xs)',
    width: fullWidth ? '100%' : 'auto',
  };
  
  // Segment base styles
  const getSegmentStyles = (isActive: boolean, isHovered: boolean): React.CSSProperties => ({
    flex: fullWidth ? 1 : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-xs)',
    height: 'calc(var(--height-sm) - var(--spacing-sm))',
    padding: '0 var(--spacing-md)',
    fontSize: 'var(--font-size-small)',
    fontWeight: 'var(--font-weight-medium)' as any,
    fontFamily: 'var(--font-family-primary)',
    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
    backgroundColor: isActive 
      ? 'var(--bg-primary)' 
      : isHovered 
        ? 'var(--bg-hover)' 
        : 'transparent',
    borderRadius: 'calc(var(--radius-standard) - var(--spacing-xs))',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 150ms ease',
    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
    whiteSpace: 'nowrap',
  });
  
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      style={containerStyles}
    >
      {options.map((option, index) => {
        const isActive = option.value === value;
        const segmentId = `${groupId}-${option.value}`;
        
        return (
          <SegmentButton
            key={option.value}
            id={segmentId}
            option={option}
            isActive={isActive}
            disabled={disabled}
            onClick={() => !disabled && onChange(option.value)}
            getStyles={getSegmentStyles}
            tabIndex={isActive ? 0 : -1}
          />
        );
      })}
    </div>
  );
};

/**
 * Individual segment button (internal component)
 */
interface SegmentButtonProps {
  id: string;
  option: SegmentedControlOption;
  isActive: boolean;
  disabled: boolean;
  onClick: () => void;
  getStyles: (isActive: boolean, isHovered: boolean) => React.CSSProperties;
  tabIndex: number;
}

const SegmentButton: React.FC<SegmentButtonProps> = ({
  id,
  option,
  isActive,
  disabled,
  onClick,
  getStyles,
  tabIndex,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <button
      id={id}
      type="button"
      role="radio"
      aria-checked={isActive}
      disabled={disabled}
      tabIndex={tabIndex}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={getStyles(isActive, isHovered)}
    >
      {option.icon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {option.icon}
        </span>
      )}
      <span>{option.label}</span>
    </button>
  );
};

export default SegmentedControl;
