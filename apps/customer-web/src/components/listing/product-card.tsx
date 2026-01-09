'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Button } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  vendorName?: string;
  categorySlug?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/products/${product.id}`)}
      className="cursor-pointer overflow-hidden transition-transform duration-200 hover:-translate-y-1"
    >
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="h-[200px] w-full object-cover"
        />
      ) : (
        <div className="h-[200px] w-full bg-[var(--bg-secondary)]" />
      )}
      
      <div className="p-[var(--spacing-lg)]">
        {product.categorySlug && (
          <Badge variant="info" className="mb-[var(--spacing-sm)]">
            {product.categorySlug}
          </Badge>
        )}
        
        <h3 className="mb-[var(--spacing-sm)] text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="mb-[var(--spacing-md)] line-clamp-2 text-[length:var(--font-size-sm)] text-[var(--text-secondary)]">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-[length:var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            {product.price} {en.currency.bhd}
          </span>
          {product.vendorName && (
            <span className="text-[length:var(--font-size-sm)] text-[var(--text-secondary)]">
              {product.vendorName}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
