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
                className="text-mono-11 hover:text-mono-12 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-mono-12 font-medium' : 'text-mono-11'}>
                {item.label}
              </span>
            )}
            
            {!isLast && (
              <span className="text-mono-9">/</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
