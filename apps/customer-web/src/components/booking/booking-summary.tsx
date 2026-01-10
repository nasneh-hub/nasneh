'use client';

import { en } from '@nasneh/ui/copy';
import { Card } from '@nasneh/ui';
import { formatCurrency } from '@/lib/utils/currency';

interface BookingSummaryProps {
  /**
   * Service details
   */
  service: {
    name: string;
    duration: number; // in minutes
    price: number;
  };
  /**
   * Provider details
   */
  provider: {
    name: string;
  };
  /**
   * Selected date (YYYY-MM-DD)
   */
  date: string;
  /**
   * Selected time (HH:MM)
   */
  time: string;
  /**
   * Service location or address
   */
  location: string;
  /**
   * Optional booking notes
   */
  notes?: string;
}

/**
 * BookingSummary Component
 * 
 * Displays a summary of the booking details for review.
 * 
 * Features:
 * - Service name, provider, date, time
 * - Location/address
 * - Optional notes
 * - Price breakdown
 */
export function BookingSummary({
  service,
  provider,
  date,
  time,
  location,
  notes,
}: BookingSummaryProps) {
  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatPrice = (price: number) => {
    return formatCurrency(price);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {en.booking.bookingSummary}
      </h3>
      
      <div className="space-y-4">
        {/* Service */}
        <div>
          <p className="text-sm text-mono-600 mb-1">
            {en.booking.service}
          </p>
          <p className="font-medium text-mono-900">
            {service.name}
          </p>
          <p className="text-sm text-mono-600">
            {service.duration} {en.booking.minutes}
          </p>
        </div>

        {/* Provider */}
        <div>
          <p className="text-sm text-mono-600 mb-1">
            {en.booking.provider}
          </p>
          <p className="font-medium text-mono-900">
            {provider.name}
          </p>
        </div>

        {/* Date & Time */}
        <div>
          <p className="text-sm text-mono-600 mb-1">
            {en.booking.dateTime}
          </p>
          <p className="font-medium text-mono-900">
            {formatDate(date)}
          </p>
          <p className="font-medium text-mono-900">
            {formatTime(time)}
          </p>
        </div>

        {/* Location */}
        <div>
          <p className="text-sm text-mono-600 mb-1">
            {en.booking.location}
          </p>
          <p className="font-medium text-mono-900">
            {location}
          </p>
        </div>

        {/* Notes (if provided) */}
        {notes && (
          <div>
            <p className="text-sm text-mono-600 mb-1">
              {en.booking.notes}
            </p>
            <p className="text-mono-900">
              {notes}
            </p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="pt-4 border-t border-mono-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-mono-600">
              {en.booking.servicePrice}
            </p>
            <p className="font-medium text-mono-900">
              {formatPrice(service.price)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-mono-900">
              {en.booking.total}
            </p>
            <p className="text-lg font-semibold text-mono-900">
              {formatPrice(service.price)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
