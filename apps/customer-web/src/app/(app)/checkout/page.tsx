'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { en } from '@nasneh/ui/copy';
import { Skeleton } from '@nasneh/ui';
import {
  AddressSelector,
  OrderNotes,
  CheckoutSummary,
  CheckoutActions,
} from '@/components/checkout';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.nasneh.com/api/v1';

// Types
interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  country: string;
  isDefault?: boolean;
}

interface CartData {
  items: Array<{
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  
  // State
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoadingAddresses(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/me/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Unauthorized - redirect to login
        router.push('/login?redirect=/checkout');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load addresses');
      }

      const data = await response.json();
      const addressList = data.data || [];
      setAddresses(addressList);

      // Auto-select default address or first address
      const defaultAddress = addressList.find((addr: Address) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addressList.length > 0) {
        setSelectedAddressId(addressList[0].id);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(en.ui.error);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [router]);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    try {
      setIsLoadingCart(true);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Unauthorized - treat as empty cart, redirect to login
        router.push('/login?redirect=/checkout');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load cart');
      }

      const data = await response.json();
      setCartData(data.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(en.ui.error);
    } finally {
      setIsLoadingCart(false);
    }
  }, [router]);

  // Load data on mount
  useEffect(() => {
    fetchAddresses();
    fetchCart();
  }, [fetchAddresses, fetchCart]);

  // Handle place order
  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddressId) {
      setError(en.checkout.addressRequired);
      return;
    }

    if (!cartData || cartData.items.length === 0) {
      setError('Cart is empty');
      return;
    }

    try {
      setIsPlacingOrder(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          notes: orderNotes || undefined,
        }),
      });

      if (response.status === 401) {
        router.push('/login?redirect=/checkout');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }

      const data = await response.json();
      const orderId = data.data?.id || data.data?.orderId;

      // Redirect to order confirmation or payment
      if (orderId) {
        router.push(`/orders/${orderId}/confirmation`);
      } else {
        router.push('/orders');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err instanceof Error ? err.message : en.ui.error);
    } finally {
      setIsPlacingOrder(false);
    }
  }, [selectedAddressId, orderNotes, cartData, router]);

  // Handle back to cart
  const handleBackToCart = useCallback(() => {
    router.push('/cart');
  }, [router]);

  // Handle add new address
  const handleAddNewAddress = useCallback(() => {
    router.push('/profile/addresses/new?redirect=/checkout');
  }, [router]);

  // Handle retry
  const handleRetry = useCallback(() => {
    fetchAddresses();
    fetchCart();
  }, [fetchAddresses, fetchCart]);

  // Loading state
  if (isLoadingAddresses || isLoadingCart) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isLoadingAddresses && !isLoadingCart) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-mono-12 mb-4">
            {en.ui.error}
          </h1>
          <p className="text-mono-10 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity"
          >
            {en.ui.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-mono-12 mb-4">
            {en.cart.emptyCart}
          </h1>
          <p className="text-mono-10 mb-6">{en.cart.emptyCartDescription}</p>
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition-opacity"
          >
            {en.cart.continueShopping}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-mono-12 mb-8">
          {en.checkout.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Address Selection */}
            <div className="p-6 rounded-xl bg-mono-2">
              <AddressSelector
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={setSelectedAddressId}
                onAddNewAddress={handleAddNewAddress}
              />
            </div>

            {/* Order Notes */}
            <div className="p-6 rounded-xl bg-mono-2">
              <OrderNotes
                value={orderNotes}
                onChange={setOrderNotes}
                maxLength={500}
              />
            </div>
          </div>

          {/* Right Column: Summary and Actions */}
          <div className="space-y-4">
            {/* Checkout Summary */}
            <CheckoutSummary
              subtotal={cartData.subtotal}
              deliveryFee={cartData.deliveryFee}
              total={cartData.total}
              itemCount={cartData.items.length}
            />

            {/* Checkout Actions */}
            <CheckoutActions
              onBack={handleBackToCart}
              onContinue={handlePlaceOrder}
              isContinuing={isPlacingOrder}
              continueDisabled={!selectedAddressId}
              continueLabel={en.checkout.placeOrder}
            />

            {/* Error Message (Inline) */}
            {error && (
              <div className="p-4 rounded-xl bg-mono-3 border border-mono-5">
                <p className="text-sm text-mono-11">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
