'use client';

import { Button } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function CartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-mono-3 flex items-center justify-center mb-6">
        <ShoppingBag className="w-12 h-12 text-mono-9" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-mono-12 mb-2">
        {en.cart.emptyCart}
      </h2>

      {/* Description */}
      <p className="text-mono-10 mb-8 max-w-md">
        {en.cart.emptyCartDescription}
      </p>

      {/* CTA Button */}
      <Link href="/products">
        <Button>{en.cart.continueShopping}</Button>
      </Link>
    </div>
  );
}
