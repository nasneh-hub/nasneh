'use client';

import { Button, Badge, Avatar } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
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
        <h1 className="text-3xl font-bold text-mono-12 mb-2">
          {product.name}
        </h1>
        <div className="text-2xl font-semibold text-mono-12">
          {product.price.toFixed(2)} {en.currency.bhd}
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
          <h2 className="text-lg font-semibold text-mono-12 mb-2">
            {en.product.description}
          </h2>
          <p className="text-mono-11 leading-relaxed">
            {product.description}
          </p>
        </div>
      )}
      
      {/* Vendor */}
      {product.vendor && (
        <div>
          <div className="text-sm text-mono-10 mb-2">{en.product.soldBy}</div>
          <Link
            href={`/vendors/${product.vendor.id}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-mono-2 hover:bg-mono-3 transition-colors"
          >
            <Avatar
              name={product.vendor.name}
              src={product.vendor.avatar}
            />
            <span className="font-medium text-mono-12">
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
