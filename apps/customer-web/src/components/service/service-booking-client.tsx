'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { en } from '@nasneh/ui/copy';
import { Button, Card, Textarea } from '@nasneh/ui';
import { MapPin, Calendar, Clock, FileText } from 'lucide-react';
import { DateCalendar } from '../booking/date-calendar';
import { TimeSlotSelector } from '../booking/time-slot-selector';
import { AddressSelector } from '../checkout/address-selector';
import { formatCurrency } from '@/lib/utils/currency';
import { getApiUrl } from '@/lib/api';

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

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  country: string;
  isDefault?: boolean;
}

export function ServiceBookingClient({ service }: ServiceBookingClientProps) {
  const router = useRouter();
  
  // State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();
  const [notes, setNotes] = useState('');
  const [slotsData, setSlotsData] = useState<DateSlots[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock addresses (TODO: fetch from API when auth is implemented)
  const [addresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Home',
      street: 'Building 123, Road 456',
      city: 'Manama',
      country: 'Bahrain',
      isDefault: true,
    },
    {
      id: '2',
      label: 'Work',
      street: 'Office Tower, Block 789',
      city: 'Riffa',
      country: 'Bahrain',
    },
  ]);

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
        const response = await fetch(
          getApiUrl(`/services/${service.id}/slots?startDate=${startDate}&endDate=${endDate}`)
        );

        if (!response.ok) {
          // If slots endpoint not implemented, show graceful message
          if (response.status === 404 || response.status === 501) {
            setError('Booking availability is not yet available for this service. Please check back later or contact the provider directly.');
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch availability');
        }

        const data: SlotsResponse = await response.json();
        
        if (data.success && data.data.dates) {
          setSlotsData(data.data.dates);
          // If no dates available, show message
          if (data.data.dates.length === 0) {
            setError('No availability found for the next 30 days. Please check back later or contact the provider.');
          }
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

  // Get selected address
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(undefined); // Reset time when date changes
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Handle continue from Step 1 to Step 2
  const handleContinueToStep2 = () => {
    setCurrentStep(2);
  };

  // Handle back from Step 2 to Step 1
  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  // Handle back from Step 3 to Step 2
  const handleBackToStep2 = () => {
    setCurrentStep(2);
  };

  // Handle address selection
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  // Handle add new address (TODO: implement when auth is ready)
  const handleAddNewAddress = () => {
    console.log('Add new address - to be implemented');
  };

  // Handle continue to Step 3
  const handleContinueToStep3 = () => {
    setCurrentStep(3);
  };

  // Check if Step 2 can proceed
  const canProceedFromStep2 = () => {
    if (service.type === 'IN_STORE') {
      return true; // No address needed for in-store
    }
    return !!selectedAddressId; // Address required for HOME and DELIVERY
  };

  // Handle booking submission
  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Prepare booking data
      const bookingData: any = {
        serviceId: service.id,
        date: selectedDate,
        startTime: selectedTime,
      };

      // Add address for HOME/DELIVERY
      if (service.type !== 'IN_STORE' && selectedAddressId) {
        bookingData.addressId = selectedAddressId;
      }

      // Add notes if provided
      if (notes.trim()) {
        bookingData.notes = notes.trim();
      }

      // TODO: Add auth token when auth is implemented
      const response = await fetch(getApiUrl('/bookings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth header when auth is implemented
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData),
      });

      if (response.status === 401) {
        // Auth required - expected for now
        setError('Authentication required. Please log in to complete your booking.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();
      
      if (result.success && result.data.id) {
        // Navigate to confirmation page
        router.push(`/bookings/${result.data.id}/confirmation`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(en.errors.somethingWrong);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/services/${service.id}`)}
            className="mb-4 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            ← {en.ui.back}
          </button>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">{en.booking.pageTitle}</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">{service.name}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl bg-[var(--destructive)]/10 p-4">
            <p className="text-[var(--destructive)]">{error}</p>
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
        {!error && currentStep === 1 && (
          <div className="space-y-8">
            {/* Date Selection */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
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
                  onClick={handleContinueToStep2}
                  size="lg"
                >
                  {en.checkout.continue}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Service Location */}
        {!error && currentStep === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
                {en.booking.step2Title}
              </h2>

              {/* HOME: Address Selector */}
              {service.type === 'HOME' && (
                <div>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    {en.booking.serviceAt}
                  </p>
                  <AddressSelector
                    addresses={addresses}
                    selectedAddressId={selectedAddressId}
                    onSelectAddress={handleSelectAddress}
                    onAddNewAddress={handleAddNewAddress}
                  />
                </div>
              )}

              {/* DELIVERY: Address Selector (same as HOME) */}
              {service.type === 'DELIVERY' && (
                <div>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    {en.checkout.selectAddress}
                  </p>
                  <AddressSelector
                    addresses={addresses}
                    selectedAddressId={selectedAddressId}
                    onSelectAddress={handleSelectAddress}
                    onAddNewAddress={handleAddNewAddress}
                  />
                </div>
              )}

              {/* IN_STORE: Provider Location */}
              {service.type === 'IN_STORE' && (
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[var(--accent-foreground)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--foreground)] mb-2">
                        {en.booking.providerLocation}
                      </h3>
                      <p className="text-[var(--muted-foreground)] mb-1">
                        {service.provider.name}
                      </p>
                      {service.provider.location && (
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {service.provider.location}
                        </p>
                      )}
                      {!service.provider.location && (
                        <p className="text-sm text-[var(--muted-foreground)] italic">
                          Location details will be provided after booking
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={handleBackToStep1}
              >
                {en.ui.back}
              </Button>
              <Button
                onClick={handleContinueToStep3}
                size="lg"
                disabled={!canProceedFromStep2()}
              >
                {en.checkout.continue}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {!error && currentStep === 3 && selectedDate && selectedTime && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">
                {en.booking.step3Title}
              </h2>

              {/* Booking Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
                  {en.booking.bookingSummary}
                </h3>
                
                <div className="space-y-4">
                  {/* Service */}
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">
                      {en.booking.service}
                    </p>
                    <p className="font-medium text-[var(--foreground)]">
                      {service.name}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {service.duration} {en.booking.minutes}
                    </p>
                  </div>

                  {/* Provider */}
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">
                      {en.booking.provider}
                    </p>
                    <p className="font-medium text-[var(--foreground)]">
                      {service.provider.name}
                    </p>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">
                      {en.booking.dateTime}
                    </p>
                    <div className="flex items-center gap-2 text-[var(--foreground)]">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{formatDate(selectedDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--foreground)] mt-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{formatTime(selectedTime)}</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-1">
                      {en.booking.location}
                    </p>
                    {service.type === 'IN_STORE' ? (
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {service.provider.name}
                        </p>
                        {service.provider.location && (
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {service.provider.location}
                          </p>
                        )}
                      </div>
                    ) : (
                      selectedAddress && (
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {selectedAddress.label}
                          </p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {selectedAddress.street}
                          </p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {selectedAddress.city}, {selectedAddress.country}
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  {/* Price */}
                  <div className="pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        {en.booking.total}
                      </p>
                      <p className="text-lg font-semibold text-[var(--foreground)]">
                        {formatCurrency(service.price)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Booking Notes */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    {en.booking.notes}
                  </h3>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    ({en.checkout.optional})
                  </span>
                </div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={en.booking.notesPlaceholder}
                  maxLength={500}
                  rows={4}
                  className="w-full"
                />
                <p className="text-sm text-[var(--muted-foreground)] mt-2">
                  {500 - notes.length} {en.checkout.charactersRemaining}
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={handleBackToStep2}
              >
                {en.ui.back}
              </Button>
              <Button
                onClick={handleConfirmBooking}
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : en.booking.confirmBooking}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
