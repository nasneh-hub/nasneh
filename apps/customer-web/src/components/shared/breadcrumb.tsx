'use client';

import Link from 'next/link';
import { en } from '@nasneh/ui/copy';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-[var(--foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-[var(--foreground)] font-medium' : 'text-[var(--foreground)]'}>
                {item.label}
              </span>
            )}
            
            {!isLast && (
              <span className="text-[var(--muted-foreground)]">/</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
