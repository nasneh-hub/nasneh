'use client';

import React from 'react';
import { Button } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
}: PaginationProps) {
  if (totalPages === 0) {
    return null;
  }

  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-[var(--spacing-md)]">
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
      >
        {en.ui.previous}
      </Button>

      <div className="flex gap-[var(--spacing-sm)]">
        {startPage > 1 && (
          <>
            <Button
              variant={currentPage === 1 ? 'default' : 'secondary'}
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
            {startPage > 2 && (
              <span className="flex items-center px-[var(--spacing-sm)] text-[var(--text-secondary)]">
                ...
              </span>
            )}
          </>
        )}

        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'secondary'}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="flex items-center px-[var(--spacing-sm)] text-[var(--text-secondary)]">
                ...
              </span>
            )}
            <Button
              variant={currentPage === totalPages ? 'default' : 'secondary'}
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
      </div>

      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
      >
        {en.ui.next}
      </Button>
    </div>
  );
}
