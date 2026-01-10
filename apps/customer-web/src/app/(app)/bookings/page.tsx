'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { Card, Button } from '@nasneh/ui';
import { en } from '@nasneh/ui/copy';
import { useAuth, getAccessToken } from '@/context/auth-context';
import { formatCurrency } from '@/lib/utils/currency';
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
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
    <div className="mx-auto max-w-[1200px] p-[var(--spacing-xl)]">
      {/* Page Header */}
      <div className="mb-[var(--spacing-2xl)]">
        <h1 className="m-0 text-[length:var(--font-size-h1)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
          {en.bookings.myBookings}
        </h1>
      </div>

      {/* Bookings Grid */}
      <div className="grid gap-[var(--spacing-lg)]">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <div className="p-[var(--spacing-xl)]">
              {/* Booking Header */}
              <div className="mb-[var(--spacing-lg)] flex flex-wrap items-start justify-between gap-[var(--spacing-md)]">
                <div>
                  <p className="m-0 mb-[var(--spacing-xs)] text-[length:var(--font-size-small)] text-[var(--text-secondary)]">
                    {en.bookings.bookingNumber}
                  </p>
                  <p className="m-0 text-[length:var(--font-size-large)] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                    #{booking.bookingNumber}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--bg-tertiary)] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[length:var(--font-size-small)] font-[var(--font-weight-medium)] capitalize text-[var(--text-secondary)]">
                  {booking.status}
                </div>
              </div>

              {/* Booking Details */}
              <div className="mb-[var(--spacing-lg)] grid gap-[var(--spacing-md)]">
                {/* Service Name */}
                <div>
                  <p className="m-0 mb-[var(--spacing-xs)] text-[length:var(--font-size-small)] text-[var(--text-secondary)]">
                    {en.products.service}
                  </p>
                  <p className="m-0 text-[length:var(--font-size-base)] font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                    {booking.serviceName}
                  </p>
                </div>

                {/* Provider Name */}
                <div>
                  <p className="m-0 mb-[var(--spacing-xs)] text-[length:var(--font-size-small)] text-[var(--text-secondary)]">
                    {en.ui.provider}
                  </p>
                  <p className="m-0 text-[length:var(--font-size-base)] font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                    {booking.providerName}
                  </p>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-[var(--spacing-md)]">
                  <div>
                    <p className="m-0 mb-[var(--spacing-xs)] text-[length:var(--font-size-small)] text-[var(--text-secondary)]">
                      {en.bookings.bookingDate}
                    </p>
                    <p className="m-0 text-[length:var(--font-size-base)] font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                      {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="m-0 mb-[var(--spacing-xs)] text-[length:var(--font-size-small)] text-[var(--text-secondary)]">
                      {en.bookings.bookingTime}
                    </p>
                    <p className="m-0 text-[length:var(--font-size-base)] font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                      {booking.bookingTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Footer */}
              <div className="flex items-center justify-between border-t border-[var(--border-primary)] pt-[var(--spacing-md)]">
                <div>
                  <p className="m-0 text-[length:var(--font-size-large)] font-[var(--font-weight-bold)] text-[var(--text-primary)]">
                    {formatCurrency(booking.total)}
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
