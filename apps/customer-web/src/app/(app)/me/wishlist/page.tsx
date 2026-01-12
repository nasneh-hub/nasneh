'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { en } from '@nasneh/ui/copy';
import { EmptyState } from '@/components/shared/empty-state';

export default function WishlistPage() {
  return (
    <EmptyState
      icon={Heart}
      title={en.wishlist.myWishlist}
      description={en.wishlist.wishlistEmpty}
      comingSoon={true}
    />
  );
}
