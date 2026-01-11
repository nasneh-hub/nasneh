'use client';

import { Button } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { formatCurrency } from '@/lib/utils/currency';
import { Minus, Plus, X } from 'lucide-react';
import Image from 'next/image';

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    vendor?: {
      name: string;
    };
  };
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

export function CartItem({ item, onQuantityChange, onRemove, isUpdating }: CartItemProps) {
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(item.id, item.quantity + 1);
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div className="flex gap-4 p-4 rounded-xl bg-[var(--muted)]">
      {/* Product Image */}
      {item.image && (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[var(--secondary)] flex-shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--foreground)] truncate">
              {item.name}
            </h3>
            {item.vendor && (
              <p className="text-sm text-[var(--muted-foreground)] truncate">
                {item.vendor.name}
              </p>
            )}
          </div>
          
          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
            aria-label={en.cart.removeFromCart}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Price and Quantity */}
        <div className="flex items-center justify-between gap-4">
          {/* Quantity Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              disabled={isUpdating || item.quantity <= 1}
              className="w-8 h-8 rounded-xl bg-[var(--secondary)] hover:bg-[var(--accent)] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4 text-[var(--foreground)]" />
            </button>
            
            <span className="w-12 text-center font-medium text-[var(--foreground)]">
              {item.quantity}
            </span>
            
            <button
              onClick={handleIncrease}
              disabled={isUpdating}
              className="w-8 h-8 rounded-xl bg-[var(--secondary)] hover:bg-[var(--accent)] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4 text-[var(--foreground)]" />
            </button>
          </div>

          {/* Item Total */}
          <div className="text-right">
            <div className="text-sm text-[var(--muted-foreground)]">{en.cart.price}</div>
            <div className="font-semibold text-[var(--foreground)]">
              {formatCurrency(itemTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
