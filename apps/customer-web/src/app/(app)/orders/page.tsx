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
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: 'var(--text-secondary)' }}>{en.ui.loading}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-lg)',
        }}
      >
        <p style={{ color: 'var(--text-error)' }}>{error}</p>
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
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--spacing-xl)',
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1
          style={{
            fontSize: 'var(--font-size-h1)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {en.orders.myOrders}
        </h1>
      </div>

      {/* Orders Grid */}
      <div
        style={{
          display: 'grid',
          gap: 'var(--spacing-lg)',
        }}
      >
        {orders.map((order) => (
          <Card key={order.id}>
            <div
              style={{
                padding: 'var(--spacing-xl)',
              }}
            >
              {/* Order Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 'var(--spacing-lg)',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-md)',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      marginBottom: 'var(--spacing-xs)',
                    }}
                  >
                    {en.orders.orderNumber}
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--font-size-large)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    #{order.orderNumber}
                  </p>
                </div>
                <div
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--font-size-small)',
                    fontWeight: 'var(--font-weight-medium)',
                    textTransform: 'capitalize',
                  }}
                  className="rounded-xl"
                >
                  {order.status}
                </div>
              </div>

              {/* Order Items */}
              <div
                style={{
                  marginBottom: 'var(--spacing-lg)',
                }}
              >
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: 'var(--spacing-sm) 0',
                      borderBottom: '1px solid var(--border-primary)',
                    }}
                  >
                    <span style={{ color: 'var(--text-primary)' }}>
                      {item.quantity}x {item.productName}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {item.price.toFixed(3)} {en.currency.bhd}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 'var(--spacing-md)',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--text-secondary)',
                      margin: 0,
                    }}
                  >
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--font-size-large)',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--text-primary)',
                      margin: 0,
                      marginTop: 'var(--spacing-xs)',
                    }}
                  >
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
