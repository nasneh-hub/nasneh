'use client';

import { en } from '@nasneh/ui/copy';
import { ProductCard } from '../listing/product-card';

interface RelatedProductsProps {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    images?: string[];
    vendor?: {
      id: string;
      name: string;
    };
  }>;
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
        {en.product.relatedProducts}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
