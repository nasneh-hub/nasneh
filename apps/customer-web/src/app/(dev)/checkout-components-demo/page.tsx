'use client';

import { useState } from 'react';
import {
  AddressSelector,
  OrderNotes,
  CheckoutSummary,
  CheckoutActions,
} from '@/components/checkout';

// Mock data
const mockAddresses = [
  {
    id: '1',
    label: 'Home',
    street: 'Building 123, Road 456, Block 789',
    city: 'Manama',
    country: 'Bahrain',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Work',
    street: 'Office Tower, Street 101',
    city: 'Riffa',
    country: 'Bahrain',
  },
  {
    id: '3',
    label: 'Parents House',
    street: 'Villa 55, Avenue 22',
    city: 'Muharraq',
    country: 'Bahrain',
  },
];

export default function CheckoutComponentsDemo() {
  const [selectedAddressId, setSelectedAddressId] = useState<string>('1');
  const [orderNotes, setOrderNotes] = useState('');
  const [isContinuing, setIsContinuing] = useState(false);
  const [showEmptyAddresses, setShowEmptyAddresses] = useState(false);

  const handleAddNewAddress = () => {
    alert('Add new address clicked');
  };

  const handleBack = () => {
    alert('Back to cart clicked');
  };

  const handleContinue = () => {
    setIsContinuing(true);
    setTimeout(() => {
      alert(`Continue clicked!\nAddress: ${selectedAddressId}\nNotes: ${orderNotes || 'None'}`);
      setIsContinuing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-mono-12 mb-8">
          Checkout Components Demo
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Address Selector */}
            <div className="p-6 rounded-xl bg-mono-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-mono-12">
                  Address Selector
                </h2>
                <button
                  onClick={() => setShowEmptyAddresses(!showEmptyAddresses)}
                  className="text-sm text-primary hover:underline"
                >
                  {showEmptyAddresses ? 'Show Addresses' : 'Show Empty State'}
                </button>
              </div>
              <AddressSelector
                addresses={showEmptyAddresses ? [] : mockAddresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={setSelectedAddressId}
                onAddNewAddress={handleAddNewAddress}
              />
            </div>

            {/* Order Notes */}
            <div className="p-6 rounded-xl bg-mono-2">
              <h2 className="text-xl font-semibold text-mono-12 mb-4">
                Order Notes
              </h2>
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
              subtotal={25.50}
              deliveryFee={0}
              total={25.50}
              itemCount={3}
            />

            {/* Checkout Actions */}
            <CheckoutActions
              onBack={handleBack}
              onContinue={handleContinue}
              isContinuing={isContinuing}
              continueDisabled={!selectedAddressId && !showEmptyAddresses}
            />
          </div>
        </div>

        {/* Component Info */}
        <div className="mt-12 p-6 rounded-xl bg-mono-2">
          <h2 className="text-xl font-semibold text-mono-12 mb-4">
            Components Demonstrated
          </h2>
          <ul className="space-y-2 text-mono-11">
            <li>✅ <strong>AddressSelector</strong> - RadioGroup-based address selection with empty state</li>
            <li>✅ <strong>OrderNotes</strong> - Textarea with character counter (max 500)</li>
            <li>✅ <strong>CheckoutSummary</strong> - Order summary with item count, subtotal, delivery, total</li>
            <li>✅ <strong>CheckoutActions</strong> - Continue and Back buttons with loading states</li>
          </ul>
          
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold text-mono-12">Features:</h3>
            <ul className="space-y-1 text-sm text-mono-10">
              <li>• RadioGroup from @nasneh/ui for address selection</li>
              <li>• Textarea from @nasneh/ui for order notes</li>
              <li>• Default address badge</li>
              <li>• Empty state for no addresses</li>
              <li>• Character counter with warning at 50 remaining</li>
              <li>• Free delivery indicator</li>
              <li>• Loading states on continue button</li>
              <li>• Disabled states when no address selected</li>
            </ul>
          </div>

          <div className="mt-4 text-sm text-mono-10">
            <strong>Note:</strong> This is a demo page. Remove before merging or guard with environment check.
          </div>
        </div>

        {/* Current State Display */}
        <div className="mt-8 p-6 rounded-xl bg-mono-2">
          <h2 className="text-xl font-semibold text-mono-12 mb-4">
            Current State
          </h2>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <span className="text-mono-10">Selected Address:</span>{' '}
              <span className="text-mono-12">{selectedAddressId || 'None'}</span>
            </div>
            <div>
              <span className="text-mono-10">Order Notes:</span>{' '}
              <span className="text-mono-12">{orderNotes || 'Empty'}</span>
            </div>
            <div>
              <span className="text-mono-10">Notes Length:</span>{' '}
              <span className="text-mono-12">{orderNotes.length} / 500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
