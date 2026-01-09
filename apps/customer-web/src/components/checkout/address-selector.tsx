'use client';

import { RadioGroup, RadioGroupItem, Button } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { MapPin, Plus } from 'lucide-react';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  country: string;
  isDefault?: boolean;
}

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId?: string;
  onSelectAddress: (addressId: string) => void;
  onAddNewAddress: () => void;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
}: AddressSelectorProps) {
  if (addresses.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-mono-2 text-center">
        <div className="w-16 h-16 rounded-full bg-mono-3 flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-mono-9" />
        </div>
        <h3 className="text-lg font-semibold text-mono-12 mb-2">
          {en.checkout.noAddresses}
        </h3>
        <p className="text-mono-10 mb-6">
          {en.checkout.noAddressesDescription}
        </p>
        <Button onClick={onAddNewAddress}>
          <Plus className="w-4 h-4 mr-2" />
          {en.checkout.addNewAddress}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-mono-12">
          {en.checkout.deliveryAddress}
        </h3>
        <button
          onClick={onAddNewAddress}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {en.checkout.addNewAddress}
        </button>
      </div>

      <RadioGroup
        value={selectedAddressId}
        onValueChange={onSelectAddress}
      >
        <div className="space-y-3">
          {addresses.map((address) => (
            <label
              key={address.id}
              className="flex items-start gap-3 p-4 rounded-xl bg-mono-2 hover:bg-mono-3 cursor-pointer transition-colors"
            >
              <RadioGroupItem
                value={address.id}
                id={address.id}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-mono-12">
                    {address.label}
                  </span>
                  {address.isDefault && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-mono-4 text-mono-11">
                      {en.checkout.defaultAddress}
                    </span>
                  )}
                </div>
                <div className="text-sm text-mono-10">
                  <div>{address.street}</div>
                  <div>{address.city}, {address.country}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
