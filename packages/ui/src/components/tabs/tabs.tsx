'use client';

import React, { useId, useCallback, KeyboardEvent, ReactNode, useRef, useEffect, useState } from 'react';

/**
 * Tab Item
 */
export interface TabItem {
  /**
   * Tab value (unique identifier)
   */
  value: string;
  
  /**
   * Tab label (from copy tokens)
   */
  label: string;
  
  /**
   * Optional icon
   */
  icon?: ReactNode;
  
  /**
   * Tab content
   */
  content: ReactNode;
  
  /**
   * Whether the tab is disabled
   * @default false
   */
  disabled?: boolean;
}

/**
 * Tabs Props
 */
export interface TabsProps {
  /**
   * Available tabs
   */
  tabs: TabItem[];
  
  /**
   * Currently active tab value
   */
  value: string;
  
  /**
   * Change handler
   */
  onChange: (value: string) => void;
  
  /**
   * Whether tabs are scrollable on mobile
   * @default true
   */
  scrollable?: boolean;
  
  /**
   * Accessible label for the tab list
   */
  'aria-label'?: string;
}

/**
 * Tabs Component
 * 
 * Navigate between different sections of content on the same page.
 * 
 * @example
 * ```tsx
 * import { Tabs } from '@nasneh/ui';
 * import { ar } from '@nasneh/ui/copy';
 * 
 * <Tabs
 *   tabs={[
 *     { value: 'details', label: ar.ui.details, content: <Details /> },
 *     { value: 'reviews', label: ar.ui.reviews, content: <Reviews /> },
 *   ]}
 *   value={activeTab}
 *   onChange={setActiveTab}
 * />
 * ```
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  value,
  onChange,
  scrollable = true,
  'aria-label': ariaLabel,
}) => {
  const groupId = useId();
  const tabListRef = useRef<HTMLDivElement>(null);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  
  const currentIndex = tabs.findIndex(tab => tab.value === value);
  const activeTab = tabs.find(tab => tab.value === value);
  
  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const enabledTabs = tabs.filter(tab => !tab.disabled);
    const currentEnabledIndex = enabledTabs.findIndex(tab => tab.value === value);
    
    let newIndex = currentEnabledIndex;
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = currentEnabledIndex > 0 ? currentEnabledIndex - 1 : enabledTabs.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = currentEnabledIndex < enabledTabs.length - 1 ? currentEnabledIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = enabledTabs.length - 1;
        break;
      default:
        return;
    }
    
    if (newIndex !== currentEnabledIndex) {
      onChange(enabledTabs[newIndex].value);
    }
  }, [tabs, value, onChange]);
  
  // Container styles
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    fontFamily: 'var(--font-family-primary)',
  };
  
  // Tab list styles
  const tabListStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'stretch',
    gap: 0,
    overflowX: scrollable ? 'auto' : 'visible',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    borderBottom: '1px solid var(--bg-tertiary)',
  };
  
  // Tab button styles
  const getTabStyles = (tab: TabItem, isActive: boolean, isHovered: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-sm)',
    height: 'var(--height-md)',
    padding: '0 var(--spacing-lg)',
    fontSize: 'var(--font-size-body)',
    fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
    fontFamily: 'var(--font-family-primary)',
    color: tab.disabled 
      ? 'var(--text-tertiary)' 
      : isActive 
        ? 'var(--text-primary)' 
        : 'var(--text-secondary)',
    backgroundColor: isHovered && !tab.disabled && !isActive ? 'var(--bg-hover)' : 'transparent',
    cursor: tab.disabled ? 'not-allowed' : 'pointer',
    opacity: tab.disabled ? 0.5 : 1,
    transition: 'all 150ms ease',
    whiteSpace: 'nowrap',
    position: 'relative',
    borderBottom: isActive ? '2px solid var(--text-primary)' : '2px solid transparent',
    marginBottom: -1,
  });
  
  // Content styles
  const contentStyles: React.CSSProperties = {
    padding: 'var(--spacing-lg) 0',
  };
  
  return (
    <div style={containerStyles}>
      <div
        ref={tabListRef}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        style={tabListStyles}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.value === value;
          const isHovered = hoveredTab === tab.value;
          const tabId = `${groupId}-tab-${tab.value}`;
          const panelId = `${groupId}-panel-${tab.value}`;
          
          return (
            <button
              key={tab.value}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              aria-disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.value)}
              onMouseEnter={() => setHoveredTab(tab.value)}
              onMouseLeave={() => setHoveredTab(null)}
              style={getTabStyles(tab, isActive, isHovered)}
            >
              {tab.icon && (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {activeTab && (
        <div
          id={`${groupId}-panel-${activeTab.value}`}
          role="tabpanel"
          aria-labelledby={`${groupId}-tab-${activeTab.value}`}
          tabIndex={0}
          style={contentStyles}
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
};

export default Tabs;
