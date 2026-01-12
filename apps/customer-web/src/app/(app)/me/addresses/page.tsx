'use client';

import { Button, Card } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { MapPin, Plus } from 'lucide-react';

export default function AddressesPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            {en.profile.myAddresses}
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Manage your delivery addresses
          </p>
        </div>
        <Button>
          <Plus size={20} className="mr-2" />
          Add Address
        </Button>
      </div>

      {/* Empty State */}
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-[var(--muted)]">
            <MapPin size={48} className="text-[var(--muted-foreground)]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              No addresses yet
            </h2>
            <p className="text-[var(--muted-foreground)] mb-4">
              Add your first delivery address to get started
            </p>
            <Button>
              <Plus size={20} className="mr-2" />
              Add Address
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
