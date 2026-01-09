'use client';

import { Button } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';

interface CartActionsProps {
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  isClearing?: boolean;
  isCheckingOut?: boolean;
  itemCount: number;
}

export function CartActions({
  onClearCart,
  onProceedToCheckout,
  isClearing,
  isCheckingOut,
  itemCount,
}: CartActionsProps) {
  const hasItems = itemCount > 0;

  return (
    <div className="space-y-3">
      {/* Proceed to Checkout */}
      <Button
        onClick={onProceedToCheckout}
        disabled={!hasItems || isCheckingOut}
        className="w-full"
      >
        {isCheckingOut ? en.common.loading : en.cart.proceedToCheckout}
      </Button>

      {/* Clear Cart */}
      {hasItems && (
        <button
          onClick={onClearCart}
          disabled={isClearing}
          className="w-full py-3 text-sm text-mono-10 hover:text-mono-12 transition-colors disabled:opacity-50"
        >
          {isClearing ? en.common.loading : en.cart.clearCart}
        </button>
      )}
    </div>
  );
}
