'use client';

import React, { useState, useCallback, ReactNode } from 'react';

/**
 * Table Column
 */
export interface TableColumn<T> {
  /**
   * Column key (matches data property)
   */
  key: string;
  
  /**
   * Column header (from copy tokens)
   */
  label: string;
  
  /**
   * Whether the column is sortable
   * @default false
   */
  sortable?: boolean;
  
  /**
   * Custom render function
   */
  render?: (value: any, row: T, index: number) => ReactNode;
  
  /**
   * Column width
   */
  width?: string;
  
  /**
   * Text alignment
   * @default 'start'
   */
  align?: 'start' | 'center' | 'end';
}

/**
 * Pagination Config
 */
export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

/**
 * Sort Config
 */
export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Table Props
 */
export interface TableProps<T extends Record<string, any>> {
  /**
   * Table columns configuration
   */
  columns: TableColumn<T>[];
  
  /**
   * Table data
   */
  data: T[];
  
  /**
   * Row click handler
   */
  onRowClick?: (row: T, index: number) => void;
  
  /**
   * Whether the table is loading
   * @default false
   */
  loading?: boolean;
  
  /**
   * Empty state message (from copy tokens)
   */
  emptyMessage?: string;
  
  /**
   * Variant
   * @default 'default'
   */
  variant?: 'default' | 'compact';
  
  /**
   * Pagination configuration
   */
  pagination?: TablePagination;
  
  /**
   * Sort change handler
   */
  onSortChange?: (sort: TableSort | null) => void;
  
  /**
   * Current sort state
   */
  sort?: TableSort | null;
  
  /**
   * Unique key for each row
   * @default 'id'
   */
  rowKey?: string;
}

/**
 * Sort Icon
 */
const SortIcon: React.FC<{ direction?: 'asc' | 'desc' | null }> = ({ direction }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    style={{ opacity: direction ? 1 : 0.3 }}
  >
    <path
      d="M6 2L9 5H3L6 2Z"
      fill={direction === 'asc' ? 'currentColor' : 'var(--text-tertiary)'}
    />
    <path
      d="M6 10L3 7H9L6 10Z"
      fill={direction === 'desc' ? 'currentColor' : 'var(--text-tertiary)'}
    />
  </svg>
);

/**
 * Table Component
 * 
 * Display structured data in rows and columns with sorting and actions.
 * 
 * @example
 * ```tsx
 * import { Table } from '@nasneh/ui';
 * import { ar } from '@nasneh/ui/copy';
 * 
 * <Table
 *   columns={[
 *     { key: 'id', label: ar.ui.id, sortable: true },
 *     { key: 'name', label: ar.ui.name },
 *   ]}
 *   data={orders}
 *   onRowClick={handleRowClick}
 * />
 * ```
 */
export function Table<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  loading = false,
  emptyMessage,
  variant = 'default',
  pagination,
  onSortChange,
  sort,
  rowKey = 'id',
}: TableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  
  const isCompact = variant === 'compact';
  
  // Handle sort click
  const handleSortClick = useCallback((column: TableColumn<T>) => {
    if (!column.sortable || !onSortChange) return;
    
    if (sort?.key === column.key) {
      if (sort.direction === 'asc') {
        onSortChange({ key: column.key, direction: 'desc' });
      } else {
        onSortChange(null);
      }
    } else {
      onSortChange({ key: column.key, direction: 'asc' });
    }
  }, [sort, onSortChange]);
  
  // Pagination calculations
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 0;
  
  // Styles
  const containerStyles: React.CSSProperties = {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 'var(--radius-standard)',
    backgroundColor: 'var(--bg-primary)',
    fontFamily: 'var(--font-family-primary)',
  };
  
  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    borderSpacing: 0,
  };
  
  const headerCellStyles = (column: TableColumn<T>): React.CSSProperties => ({
    padding: isCompact ? 'var(--spacing-sm) var(--spacing-md)' : 'var(--spacing-md) var(--spacing-lg)',
    fontSize: 'var(--font-size-small)',
    fontWeight: 'var(--font-weight-semibold)' as any,
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-secondary)',
    textAlign: column.align || 'start',
    whiteSpace: 'nowrap',
    cursor: column.sortable ? 'pointer' : 'default',
    userSelect: 'none',
    width: column.width,
    position: 'sticky',
    top: 0,
    zIndex: 1,
  });
  
  const getRowStyles = (index: number, isHovered: boolean): React.CSSProperties => ({
    backgroundColor: isHovered 
      ? 'var(--bg-hover)' 
      : index % 2 === 0 
        ? 'var(--bg-primary)' 
        : 'var(--bg-secondary)',
    cursor: onRowClick ? 'pointer' : 'default',
    transition: 'background-color 150ms ease',
  });
  
  const cellStyles = (column: TableColumn<T>): React.CSSProperties => ({
    padding: isCompact ? 'var(--spacing-sm) var(--spacing-md)' : 'var(--spacing-md) var(--spacing-lg)',
    fontSize: 'var(--font-size-small)',
    color: 'var(--text-primary)',
    textAlign: column.align || 'start',
    verticalAlign: 'middle',
  });
  
  const emptyStyles: React.CSSProperties = {
    padding: 'var(--spacing-3xl)',
    textAlign: 'center',
    color: 'var(--text-tertiary)',
    fontSize: 'var(--font-size-body)',
  };
  
  const paginationStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'var(--bg-secondary)',
    fontSize: 'var(--font-size-small)',
    color: 'var(--text-secondary)',
  };
  
  const pageButtonStyles = (isDisabled: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    fontSize: 'var(--font-size-small)',
    fontFamily: 'var(--font-family-primary)',
    color: isDisabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
    backgroundColor: 'transparent',
    borderRadius: 'var(--radius-standard)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: 'background-color 150ms ease',
  });
  
  // Loading skeleton
  if (loading) {
    return (
      <div style={containerStyles}>
        <table style={tableStyles}>
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.key} style={headerCellStyles(column)}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex} style={getRowStyles(rowIndex, false)}>
                {columns.map(column => (
                  <td key={column.key} style={cellStyles(column)}>
                    <div
                      style={{
                        height: 16,
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-standard)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  // Empty state
  if (data.length === 0) {
    return (
      <div style={containerStyles}>
        <table style={tableStyles}>
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.key} style={headerCellStyles(column)}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div style={emptyStyles}>
          {emptyMessage || 'No data available'}
        </div>
      </div>
    );
  }
  
  return (
    <div style={containerStyles}>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyles}>
          <thead>
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  style={headerCellStyles(column)}
                  onClick={() => handleSortClick(column)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    {column.label}
                    {column.sortable && (
                      <SortIcon
                        direction={sort?.key === column.key ? sort.direction : null}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={row[rowKey] ?? rowIndex}
                style={getRowStyles(rowIndex, hoveredRow === rowIndex)}
                onClick={() => onRowClick?.(row, rowIndex)}
                onMouseEnter={() => setHoveredRow(rowIndex)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {columns.map(column => (
                  <td key={column.key} style={cellStyles(column)}>
                    {column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <div style={paginationStyles}>
          <span>
            {((pagination.page - 1) * pagination.pageSize) + 1}
            {' - '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            {' / '}
            {pagination.total}
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <button
              type="button"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={pageButtonStyles(pagination.page <= 1)}
              aria-label="Previous page"
            >
              ‹
            </button>
            
            <span style={{ padding: '0 var(--spacing-sm)' }}>
              {pagination.page} / {totalPages}
            </span>
            
            <button
              type="button"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              style={pageButtonStyles(pagination.page >= totalPages)}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
