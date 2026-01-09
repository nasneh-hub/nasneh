'use client';

import { Avatar } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { Info } from 'lucide-react';

interface VendorBannerProps {
  vendor: {
    id: string;
    name: string;
    avatar?: string;
  };
  showWarning?: boolean;
}

export function VendorBanner({ vendor, showWarning }: VendorBannerProps) {
  return (
    <div className="rounded-xl bg-mono-2 p-4">
      {/* Vendor Info */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar
          name={vendor.name}
          src={vendor.avatar}
        />
        <div className="flex-1">
          <div className="text-sm text-mono-10">{en.cart.vendor}</div>
          <div className="font-medium text-mono-12">
            {en.cart.vendorInfo.replace('{vendorName}', vendor.name)}
          </div>
        </div>
      </div>

      {/* Single-Vendor Warning */}
      {showWarning && (
        <div className="flex gap-2 p-3 rounded-xl bg-mono-3">
          <Info className="w-5 h-5 text-mono-10 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-mono-11">
            {en.cart.singleVendorWarning}
          </p>
        </div>
      )}
    </div>
  );
}
