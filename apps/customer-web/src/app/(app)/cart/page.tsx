'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import {
  CartItem,
  CartSummary,
  CartEmptyState,
  VendorBanner,
  CartActions,
} from '@/components/cart';
import { getApiUrl } from '@/lib/api';

interface CartItemData {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  vendor?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface CartData {
  items: CartItemData[];
  vendor?: {
    id: string;
    name: string;
    avatar?: string;
  };
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(getApiUrl('/cart'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - cart is empty or user not logged in
          setCart({ items: [], subtotal: 0, deliveryFee: 0, total: 0 });
          return;
        }
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      
      // Transform API response to match our CartData interface
      const transformedCart: CartData = {
        items: data.data?.items || [],
        vendor: data.data?.vendor,
        subtotal: data.data?.subtotal || 0,
        deliveryFee: data.data?.deliveryFee || 0,
        total: data.data?.total || 0,
      };

      setCart(transformedCart);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cart');
      // Set empty cart on error
      setCart({ items: [], subtotal: 0, deliveryFee: 0, total: 0 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update item quantity
  const handleQuantityChange = useCallback(async (itemId: string, quantity: number) => {
    if (!cart) return;

    setUpdatingItemId(itemId);

    try {
      const response = await fetch(getApiUrl(`/cart/items/${itemId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      // Refresh cart after update
      await fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError(err instanceof Error ? err.message : 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  }, [cart, fetchCart]);

  // Remove item
  const handleRemoveItem = useCallback(async (itemId: string) => {
    if (!cart) return;

    setUpdatingItemId(itemId);

    try {
      const response = await fetch(getApiUrl(`/cart/items/${itemId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      // Refresh cart after removal
      await fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove item');
    } finally {
      setUpdatingItemId(null);
    }
  }, [cart, fetchCart]);

  // Clear cart
  const handleClearCart = useCallback(async () => {
    setIsClearing(true);

    try {
      const response = await fetch(getApiUrl('/cart'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      // Refresh cart after clearing
      await fetchCart();
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
    } finally {
      setIsClearing(false);
    }
  }, [fetchCart]);

  // Proceed to checkout
  const handleCheckout = useCallback(() => {
    setIsCheckingOut(true);
    router.push('/checkout');
  }, [router]);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !cart) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-mono-12 mb-2">
            {en.ui.error}
          </h2>
          <p className="text-mono-10 mb-8">{error}</p>
          <button
            onClick={fetchCart}
            className="text-primary hover:underline"
          >
            {en.ui.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-mono-12 mb-8">
          {en.cart.title}
        </h1>
        <CartEmptyState />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-mono-12 mb-8">
        {en.cart.title}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor Banner */}
          {cart.vendor && (
            <VendorBanner vendor={cart.vendor} showWarning={true} />
          )}

          {/* Cart Items */}
          <div className="space-y-4">
            {cart.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
                isUpdating={updatingItemId === item.id}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Summary and Actions */}
        <div className="space-y-4">
          <CartSummary
            subtotal={cart.subtotal}
            deliveryFee={cart.deliveryFee}
            total={cart.total}
          />
          <CartActions
            onClearCart={handleClearCart}
            onProceedToCheckout={handleCheckout}
            isClearing={isClearing}
            isCheckingOut={isCheckingOut}
            itemCount={cart.items.length}
          />
        </div>
      </div>

      {/* Error Toast (inline, not permanent) */}
      {error && (
        <div className="fixed bottom-4 right-4 p-4 rounded-xl bg-mono-2 border border-mono-6 shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="font-medium text-mono-12 mb-1">
                {en.ui.error}
              </div>
              <div className="text-sm text-mono-10">{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-mono-10 hover:text-mono-12"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
