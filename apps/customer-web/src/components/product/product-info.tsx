'use client';

import { Button, Badge, Avatar } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock?: number;
    status?: string;
    vendor?: {
      id: string;
      name: string;
      avatar?: string;
    };
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

export function ProductInfo({ product, onAddToCart, isAddingToCart }: ProductInfoProps) {
  const isOutOfStock = product.stock === 0 || product.status === 'out_of_stock';
  const isLimitedStock = product.stock && product.stock > 0 && product.stock <= 5;
  
  return (
    <div className="flex flex-col gap-6">
      {/* Title and Price */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          {product.name}
        </h1>
        <div className="text-2xl font-semibold text-[var(--foreground)]">
          {formatCurrency(product.price)}
        </div>
      </div>
      
      {/* Stock Status */}
      {isOutOfStock ? (
        <Badge variant="default">{en.product.outOfStock}</Badge>
      ) : isLimitedStock ? (
        <Badge variant="default">{en.product.limitedStock}</Badge>
      ) : (
        <Badge variant="default">{en.product.inStock}</Badge>
      )}
      
      {/* Description */}
      {product.description && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            {en.product.description}
          </h2>
          <p className="text-[var(--foreground)] leading-relaxed">
            {product.description}
          </p>
        </div>
      )}
      
      {/* Vendor */}
      {product.vendor && (
        <div>
          <div className="text-sm text-[var(--muted-foreground)] mb-2">{en.product.soldBy}</div>
          <Link
            href={`/vendors/${product.vendor.id}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--secondary)] transition-colors"
          >
            <Avatar
              name={product.vendor.name}
              src={product.vendor.avatar}
            />
            <span className="font-medium text-[var(--foreground)]">
              {product.vendor.name}
            </span>
          </Link>
        </div>
      )}
      
      {/* Add to Cart Button */}
      <Button
        onClick={onAddToCart}
        disabled={isOutOfStock || isAddingToCart}
        className="w-full"
      >
        {isAddingToCart ? en.common.loading : en.product.addToCart}
      </Button>
    </div>
  );
}
