'use client';

import React from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  loading?: boolean;
  emptyMessage?: string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
}

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function Table<T>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyMessage = 'No data available',
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
  className = '',
}: TableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="bg-[var(--bg-secondary)]">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-4 py-3
                  text-xs font-semibold uppercase tracking-wider
                  text-[color:var(--text-secondary)]
                  ${alignClasses[column.align || 'left']}
                  ${column.width || ''}
                  ${column.sortable ? 'cursor-pointer select-none hover:text-[color:var(--text-primary)]' : ''}
                `}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {column.header}
                  {column.sortable && sortKey === column.key && (
                    <svg
                      className={`w-4 h-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--bg-tertiary)]">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <div className="h-4 bg-[var(--bg-tertiary)] rounded-xl animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-[color:var(--text-tertiary)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                onClick={() => onRowClick?.(row, index)}
                className={`
                  bg-[var(--bg-primary)]
                  ${onRowClick ? 'cursor-pointer hover:bg-[var(--bg-secondary)]' : ''}
                  transition-colors
                `}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      px-4 py-3
                      text-sm text-[color:var(--text-primary)]
                      ${alignClasses[column.align || 'left']}
                      ${column.width || ''}
                    `}
                  >
                    {column.render
                      ? column.render(row, index)
                      : (row as Record<string, unknown>)[column.key] as React.ReactNode
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
