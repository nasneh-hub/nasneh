'use client';

import { useState } from 'react';
import {
  CartItem,
  CartSummary,
  CartEmptyState,
  VendorBanner,
  CartActions,
} from '@/components/cart';

// Mock data
const mockVendor = {
  id: '1',
  name: 'Fresh Farms Bahrain',
  avatar: undefined,
};

const mockCartItems = [
  {
    id: '1',
    name: 'Fresh Organic Tomatoes',
    price: 2.5,
    quantity: 3,
    image: undefined,
    vendor: mockVendor,
  },
  {
    id: '2',
    name: 'Local Honey 500g',
    price: 5.0,
    quantity: 1,
    image: undefined,
    vendor: mockVendor,
  },
  {
    id: '3',
    name: 'Handmade Pottery Bowl',
    price: 12.5,
    quantity: 2,
    image: undefined,
    vendor: mockVendor,
  },
];

export default function CartComponentsDemo() {
  const [items, setItems] = useState(mockCartItems);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setIsUpdating(true);
    setTimeout(() => {
      setItems(items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
      setIsUpdating(false);
    }, 500);
  };

  const handleRemove = (itemId: string) => {
    setIsUpdating(true);
    setTimeout(() => {
      setItems(items.filter(item => item.id !== itemId));
      setIsUpdating(false);
    }, 500);
  };

  const handleClearCart = () => {
    setIsClearing(true);
    setTimeout(() => {
      setItems([]);
      setIsClearing(false);
    }, 500);
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      alert('Proceeding to checkout...');
      setIsCheckingOut(false);
    }, 500);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 10 ? 0 : 1.5;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">
          Cart Components Demo
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vendor Banner */}
            {items.length > 0 && (
              <VendorBanner vendor={mockVendor} showWarning={true} />
            )}

            {/* Cart Items or Empty State */}
            {items.length === 0 ? (
              <CartEmptyState />
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                    isUpdating={isUpdating}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Summary and Actions */}
          {items.length > 0 && (
            <div className="space-y-4">
              <CartSummary
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                total={total}
              />
              <CartActions
                onClearCart={handleClearCart}
                onProceedToCheckout={handleCheckout}
                isClearing={isClearing}
                isCheckingOut={isCheckingOut}
                itemCount={items.length}
              />
            </div>
          )}
        </div>

        {/* Component Info */}
        <div className="mt-12 p-6 rounded-xl bg-[var(--muted)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Components Demonstrated
          </h2>
          <ul className="space-y-2 text-[var(--foreground)]">
            <li>✅ <strong>CartItem</strong> - Product card with quantity control</li>
            <li>✅ <strong>CartSummary</strong> - Subtotal, delivery fee, total</li>
            <li>✅ <strong>CartEmptyState</strong> - Empty cart message (remove all items to see)</li>
            <li>✅ <strong>VendorBanner</strong> - Vendor info with single-vendor warning</li>
            <li>✅ <strong>CartActions</strong> - Proceed to checkout + clear cart</li>
          </ul>
          <div className="mt-4 text-sm text-[var(--muted-foreground)]">
            <strong>Note:</strong> This is a demo page. Remove before merging or guard with environment check.
          </div>
        </div>
      </div>
    </div>
  );
}
