'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { en } from '@nasneh/ui/copy';
import { Button, Card, Badge } from '@nasneh/ui';
import { Check, X, Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface BookingData {
  id: string;
  serviceId: string;
  customerId: string;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
    type: 'HOME' | 'IN_STORE' | 'DELIVERY';
  };
  provider: {
    id: string;
    name: string;
    location?: string;
  };
  address?: {
    id: string;
    label: string;
    street: string;
    city: string;
    country: string;
  };
}

/**
 * Booking Confirmation Page
 * 
 * Displays booking details after successful creation
 * 
 * Route: /bookings/[id]/confirmation
 */
export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.nasneh.com';
        
        // TODO: Add auth token when auth is implemented
        const response = await fetch(
          `${apiUrl}/api/v1/bookings/${bookingId}`,
          {
            credentials: 'include',
            // TODO: Add auth header when auth is implemented
            // headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication required to view booking details');
            return;
          } else if (response.status === 404) {
            setError('Booking not found');
            return;
          } else {
            setError(en.ui.error);
            return;
          }
        }

        const data = await response.json();
        setBooking(data.data);
      } catch (err) {
        setError(en.ui.error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time (12-hour)
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get status badge variant
  const getStatusVariant = (
    status: BookingData['status']
  ): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
      case 'IN_PROGRESS':
        return 'info';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="h-8 bg-[var(--muted)] rounded-xl animate-pulse w-64" />
          <div className="h-96 bg-[var(--muted)] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--destructive)]/10 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-[var(--destructive)]" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-[var(--foreground)]">
              {error || en.ui.error}
            </h2>
            <p className="text-[var(--muted-foreground)] mb-6">
              The booking you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="secondary" onClick={() => router.push('/services')}>
                {en.booking.backToService}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-[var(--foreground)]">
            {en.booking.confirmationTitle}
          </h1>
          <p className="text-[var(--muted-foreground)] mb-4">
            {en.booking.bookingConfirmed}
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <span>{en.booking.bookingReference}:</span>
            <span className="font-mono font-semibold">{booking.id}</span>
          </div>
        </Card>

        {/* Booking Details */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{en.booking.bookingSummary}</h2>
            <Badge variant={getStatusVariant(booking.status)}>
              {en.booking[booking.status.toLowerCase() as keyof typeof en.booking]}
            </Badge>
          </div>

          <div className="space-y-4">
            {/* Service */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--secondary)] flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[var(--muted-foreground)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--muted-foreground)]">{en.booking.service}</p>
                <p className="font-semibold text-[var(--foreground)]">{booking.service.name}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {booking.provider.name} • {booking.service.duration} {en.booking.minutes}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[var(--foreground)]">
                  {formatCurrency(booking.service.price)}
                </p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--secondary)] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--muted-foreground)]">{en.booking.dateTime}</p>
                <p className="font-semibold text-[var(--foreground)]">
                  {formatDate(booking.date)}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(booking.time)}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--secondary)] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[var(--muted-foreground)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--muted-foreground)]">{en.booking.location}</p>
                {booking.service.type === 'HOME' && booking.address ? (
                  <>
                    <p className="font-semibold text-[var(--foreground)]">
                      {booking.address.label}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {booking.address.street}, {booking.address.city},{' '}
                      {booking.address.country}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-[var(--foreground)]">
                      {booking.provider.name}
                    </p>
                    {booking.provider.location && (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {booking.provider.location}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="pt-4 border-t border-[var(--border)]">
                <p className="text-sm text-[var(--muted-foreground)] mb-2">{en.booking.notes}</p>
                <p className="text-[var(--foreground)]">{booking.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={() => router.push('/services')}
            className="flex-1"
          >
            {en.booking.continueBrowsing}
          </Button>
          <Button
            onClick={() => router.push('/bookings')}
            className="flex-1"
          >
            {en.booking.viewBookings}
          </Button>
        </div>
      </div>
    </div>
  );
}
