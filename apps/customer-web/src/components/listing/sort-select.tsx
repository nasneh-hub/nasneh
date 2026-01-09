'use client';

import React from 'react';
import { Select } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';

interface SortSelectProps {
  type: 'products' | 'services';
  value: string;
  onChange: (value: string) => void;
}

export function SortSelect({ type, value, onChange }: SortSelectProps) {
  // Products API: sort + order params
  const productOptions = [
    { value: 'createdAt:desc', label: en.listing.newest },
    { value: 'createdAt:asc', label: en.listing.oldest },
    { value: 'price:asc', label: en.listing.priceLowToHigh },
    { value: 'price:desc', label: en.listing.priceHighToLow },
    { value: 'name:asc', label: en.listing.nameAtoZ },
    { value: 'name:desc', label: en.listing.nameZtoA },
  ];

  // Services API: sortBy param
  const serviceOptions = [
    { value: 'newest', label: en.listing.newest },
    { value: 'oldest', label: en.listing.oldest },
    { value: 'price_asc', label: en.listing.priceLowToHigh },
    { value: 'price_desc', label: en.listing.priceHighToLow },
    { value: 'name_asc', label: en.listing.nameAtoZ },
    { value: 'name_desc', label: en.listing.nameZtoA },
  ];

  const options = type === 'products' ? productOptions : serviceOptions;

  return (
    <div className="flex items-center gap-[var(--spacing-md)]">
      <span className="text-[length:var(--font-size-sm)] text-[var(--text-secondary)]">
        {en.listing.sortBy}:
      </span>
      <Select
        options={options}
        value={value}
        onChange={(newValue) => onChange(newValue as string)}
      />
    </div>
  );
}
