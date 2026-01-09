'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { Card, Button } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { useAuth, getAccessToken } from '@/context/auth-context';
import { EmptyState } from '@/components/shared/empty-state';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, authLoading, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setOrders(data.data);
      }
    } catch (err) {
      setError(en.errors.somethingWrong);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-[var(--text-secondary)]">{en.ui.loading}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-[var(--spacing-lg)]">
        <p className="text-[var(--text-error)]">{error}</p>
        <Button onClick={fetchOrders}>{en.ui.tryAgain}</Button>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={en.orders.myOrders}
        description={en.orders.orderHistory}
        action={{
          label: en.orders.startShopping,
          onClick: () => router.push('/'),
        }}
      />
    );
  }

  // Orders list
  return (
    <div className="mx-auto max-w-[1200px] p-[var(--spacing-xl)]">
      {/* Page Header */}
      <div className="mb-[var(--spacing-2xl)]">
        <h1 className="m-0 text-[length:var(--font-size-h1)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
          {en.orders.myOrders}
        </h1>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-[var(--spacing-lg)]">
        {orders.map((order) => (
          <Card key={order.id}>
            <div className="p-[var(--spacing-xl)]">
              {/* Order Header */}
              <div className="mb-[var(--spacing-lg)] flex flex-wrap items-start justify-between gap-[var(--spacing-md)]">
                <div>
                  <p className="m-0 mb-[var(--spacing-xs)] text-[length:var(--font-size-small)] text-[var(--text-secondary)]">
                    {en.orders.orderNumber}
                  </p>
                  <p className="m-0 text-[length:var(--font-size-large)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                    #{order.orderNumber}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--bg-tertiary)] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[length:var(--font-size-small)] font-[var(--font-weight-medium)] capitalize text-[var(--text-secondary)]">
                  {order.status}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-[var(--spacing-lg)]">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between border-b border-[var(--border-primary)] py-[var(--spacing-sm)]"
                  >
                    <span className="text-[var(--text-primary)]">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {item.price.toFixed(3)} {en.currency.bhd}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex items-center justify-between pt-[var(--spacing-md)]">
                <div>
                  <p className="m-0 text-[length:var(--font-size-small)] text-[var(--text-secondary)]">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="m-0 mt-[var(--spacing-xs)] text-[length:var(--font-size-large)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
                    {order.total.toFixed(3)} {en.currency.bhd}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  {en.orders.orderDetails}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
