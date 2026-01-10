'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { en } from '@nasneh/ui/copy';
import { Button } from '@nasneh/ui';
import { DateCalendar } from '../booking/date-calendar';
import { TimeSlotSelector } from '../booking/time-slot-selector';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  type: 'HOME' | 'IN_STORE' | 'DELIVERY';
  provider: {
    id: string;
    name: string;
    location?: string;
  };
}

interface ServiceBookingClientProps {
  service: Service;
}

interface SlotData {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface DateSlots {
  date: string;
  dayOfWeek: string;
  available: boolean;
  slots: SlotData[];
}

interface SlotsResponse {
  success: boolean;
  data: {
    serviceId: string;
    serviceName: string;
    duration: number;
    dates: DateSlots[];
  };
}

export function ServiceBookingClient({ service }: ServiceBookingClientProps) {
  const router = useRouter();
  
  // State
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [slotsData, setSlotsData] = useState<DateSlots[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch slots on mount
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Calculate date range (next 30 days)
        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        
        const endDateObj = new Date(today);
        endDateObj.setDate(endDateObj.getDate() + 30);
        const endDate = endDateObj.toISOString().split('T')[0];

        // Fetch slots from API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.nasneh.com';
        const response = await fetch(
          `${apiUrl}/api/v1/services/${service.id}/slots?startDate=${startDate}&endDate=${endDate}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch availability');
        }

        const data: SlotsResponse = await response.json();
        
        if (data.success && data.data.dates) {
          setSlotsData(data.data.dates);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
        setError(en.errors.somethingWrong);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [service.id]);

  // Get dates for calendar
  const calendarDates = slotsData.map(({ date, available }) => ({
    date,
    available,
  }));

  // Get slots for selected date
  const selectedDateSlots = selectedDate
    ? slotsData.find((d) => d.date === selectedDate)?.slots || []
    : [];

  const timeSlots = selectedDateSlots.map((slot) => ({
    time: slot.startTime,
    available: slot.available,
  }));

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(undefined); // Reset time when date changes
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Handle continue (for future PRs)
  const handleContinue = () => {
    // TODO: PR2 will implement Step 2 (location selection)
    console.log('Selected:', { date: selectedDate, time: selectedTime });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/services/${service.id}`)}
            className="mb-4 text-mono-11 hover:text-mono-12 transition-colors"
          >
            ← {en.ui.back}
          </button>
          <h1 className="text-3xl font-bold text-mono-12">{en.booking.pageTitle}</h1>
          <p className="mt-2 text-mono-11">{service.name}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl bg-destructive/10 p-4">
            <p className="text-destructive">{error}</p>
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              {en.ui.tryAgain}
            </Button>
          </div>
        )}

        {/* Step 1: Select Date & Time */}
        {!error && (
          <div className="space-y-8">
            {/* Date Selection */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-mono-12">
                {en.booking.step1Title}
              </h2>
              <DateCalendar
                dates={calendarDates}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                isLoading={isLoading}
              />
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <TimeSlotSelector
                  slots={timeSlots}
                  selectedTime={selectedTime}
                  onSelectTime={handleTimeSelect}
                  isLoading={false}
                />
              </div>
            )}

            {/* Continue Button */}
            {selectedDate && selectedTime && (
              <div className="flex justify-end">
                <Button
                  onClick={handleContinue}
                  size="lg"
                >
                  {en.checkout.continue}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
