'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { Card, Button } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { useAuth, getAccessToken } from '@/context/auth-context';
import { EmptyState } from '@/components/shared/empty-state';

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  serviceName: string;
  providerName: string;
  bookingDate: string;
  bookingTime: string;
  total: number;
  createdAt: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchBookings();
  }, [isAuthenticated, authLoading, router]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getAccessToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setBookings(data.data);
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
        <Button onClick={fetchBookings}>{en.ui.tryAgain}</Button>
      </div>
    );
  }

  // Empty state
  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title={en.bookings.myBookings}
        description={en.bookings.bookingHistory}
        action={{
          label: en.bookings.bookService,
          onClick: () => router.push('/services'),
        }}
      />
    );
  }

  // Bookings list
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
          {en.bookings.myBookings}
        </h1>
      </div>

      {/* Bookings Grid */}
      <div
        style={{
          display: 'grid',
          gap: 'var(--spacing-lg)',
        }}
      >
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <div
              style={{
                padding: 'var(--spacing-xl)',
              }}
            >
              {/* Booking Header */}
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
                    {en.bookings.bookingNumber}
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--font-size-large)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    #{booking.bookingNumber}
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
                  {booking.status}
                </div>
              </div>

              {/* Booking Details */}
              <div
                style={{
                  display: 'grid',
                  gap: 'var(--spacing-md)',
                  marginBottom: 'var(--spacing-lg)',
                }}
              >
                {/* Service Name */}
                <div>
                  <p
                    style={{
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      marginBottom: 'var(--spacing-xs)',
                    }}
                  >
                    {en.products.service}
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {booking.serviceName}
                  </p>
                </div>

                {/* Provider Name */}
                <div>
                  <p
                    style={{
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      marginBottom: 'var(--spacing-xs)',
                    }}
                  >
                    {en.ui.provider}
                  </p>
                  <p
                    style={{
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {booking.providerName}
                  </p>
                </div>

                {/* Date & Time */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
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
                      {en.bookings.bookingDate}
                    </p>
                    <p
                      style={{
                        fontSize: 'var(--font-size-base)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--text-primary)',
                        margin: 0,
                      }}
                    >
                      {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 'var(--font-size-small)',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        marginBottom: 'var(--spacing-xs)',
                      }}
                    >
                      {en.bookings.bookingTime}
                    </p>
                    <p
                      style={{
                        fontSize: 'var(--font-size-base)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--text-primary)',
                        margin: 0,
                      }}
                    >
                      {booking.bookingTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 'var(--spacing-md)',
                  borderTop: '1px solid var(--border-primary)',
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 'var(--font-size-large)',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {booking.total.toFixed(3)} {en.currency.bhd}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                >
                  {en.bookings.bookingDetails}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
