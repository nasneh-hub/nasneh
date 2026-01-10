'use client';

import { en } from '@nasneh/ui/copy';
import { formatCurrency } from '@/lib/utils/currency';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export function CartSummary({ subtotal, deliveryFee, total }: CartSummaryProps) {
  const isFreeDelivery = deliveryFee === 0;

  return (
    <div className="p-6 rounded-xl bg-mono-2">
      <h2 className="text-lg font-semibold text-mono-12 mb-4">
        {en.checkout.orderSummary}
      </h2>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-mono-11">
          <span>{en.cart.subtotal}</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        {/* Delivery Fee */}
        <div className="flex items-center justify-between text-mono-11">
          <span>{en.cart.deliveryFee}</span>
          <span>
            {isFreeDelivery ? (
              <span className="text-primary font-medium">{en.cart.freeDelivery}</span>
            ) : (
              formatCurrency(deliveryFee)
            )}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-mono-5" />

        {/* Total */}
        <div className="flex items-center justify-between text-lg font-semibold text-mono-12">
          <span>{en.cart.total}</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
