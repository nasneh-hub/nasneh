'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { en } from '@nasneh/ui/copy';
import { Button, Card } from '@nasneh/ui';
import {
  DateCalendar,
  TimeSlotSelector,
  BookingActions,
  BookingSummary,
} from '@/components/booking';
import { AddressSelector } from '@/components/checkout';

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

interface SlotData {
  date: string;
  slots: Array<{
    time: string;
    available: boolean;
  }>;
}

interface BookingAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  country: string;
  isDefault?: boolean;
}

type Step = 1 | 2 | 3;

interface ServiceBookingClientProps {
  service: Service;
}

export function ServiceBookingClient({ service }: ServiceBookingClientProps) {
  const router = useRouter();

  // Page state
  const [step, setStep] = useState<Step>(1);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 state
  const [slotsData, setSlotsData] = useState<SlotData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedTime, setSelectedTime] = useState<string>();

  // Step 2 state
  const [addresses, setAddresses] = useState<BookingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>();

  // Step 3 state
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  // Fetch addresses when moving to step 2
  useEffect(() => {
    if (step === 2 && service.type === 'HOME') {
      fetchAddresses();
    }
  }, [step, service.type]);

  const fetchSlots = async (date: string) => {
    try {
      setIsLoadingSlots(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/services/${service.id}/slots?date=${date}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSlotsData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/addresses`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAddresses(data.data);
          // Auto-select default address
          const defaultAddress = data.data.find((addr: BookingAddress) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(undefined); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep((step + 1) as Step);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setIsCreatingBooking(true);
      setError(null);

      const bookingData = {
        serviceId: service.id,
        date: selectedDate,
        time: selectedTime,
        addressId: service.type === 'HOME' ? selectedAddressId : undefined,
        notes: bookingNotes,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const data = await response.json();
      if (data.success && data.data) {
        // Redirect to booking confirmation
        router.push(`/bookings/${data.data.id}/confirmation`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(en.booking.errorCreating);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const canProceedToStep2 = selectedDate && selectedTime;
  const canProceedToStep3 = service.type === 'HOME' ? selectedAddressId : true;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-mono-12">{en.booking.title}</h1>
          <p className="mt-2 text-mono-11">{service.name}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {/* Booking Steps */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              {/* Step 1: Date & Time */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-mono-12">
                      {en.booking.selectDateTime}
                    </h2>
                    <p className="mt-1 text-sm text-mono-11">
                      {en.booking.selectDateTimeDescription}
                    </p>
                  </div>

                  <DateCalendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                  />

                  {selectedDate && (
                    <TimeSlotSelector
                      slots={slotsData}
                      selectedTime={selectedTime}
                      onTimeSelect={handleTimeSelect}
                      isLoading={isLoadingSlots}
                    />
                  )}

                  <BookingActions
                    onNext={handleNextStep}
                    onPrev={handlePrevStep}
                    canProceed={!!canProceedToStep2}
                    showPrev={false}
                    nextLabel={en.common.next}
                  />
                </div>
              )}

              {/* Step 2: Location */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-mono-12">
                      {en.booking.selectLocation}
                    </h2>
                    <p className="mt-1 text-sm text-mono-11">
                      {service.type === 'HOME'
                        ? en.booking.selectLocationDescription
                        : en.booking.providerLocationDescription}
                    </p>
                  </div>

                  {service.type === 'HOME' ? (
                    <AddressSelector
                      addresses={addresses}
                      selectedAddressId={selectedAddressId}
                      onAddressSelect={setSelectedAddressId}
                      isLoading={isLoadingAddresses}
                    />
                  ) : (
                    <div className="rounded-xl bg-mono-2 p-4">
                      <p className="font-medium text-mono-12">
                        {service.provider.name}
                      </p>
                      {service.provider.location && (
                        <p className="mt-1 text-sm text-mono-11">
                          {service.provider.location}
                        </p>
                      )}
                    </div>
                  )}

                  <BookingActions
                    onNext={handleNextStep}
                    onPrev={handlePrevStep}
                    canProceed={!!canProceedToStep3}
                    showPrev={true}
                    nextLabel={en.common.next}
                    prevLabel={en.common.back}
                  />
                </div>
              )}

              {/* Step 3: Review & Confirm */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-mono-12">
                      {en.booking.reviewAndConfirm}
                    </h2>
                    <p className="mt-1 text-sm text-mono-11">
                      {en.booking.reviewAndConfirmDescription}
                    </p>
                  </div>

                  {/* Booking Notes */}
                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-mono-12"
                    >
                      {en.booking.notes}
                    </label>
                    <textarea
                      id="notes"
                      rows={4}
                      className="mt-2 w-full rounded-xl border border-mono-6 bg-mono-1 px-4 py-3 text-mono-12 placeholder:text-mono-9 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder={en.booking.notesPlaceholder}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                    />
                  </div>

                  <BookingActions
                    onNext={handleConfirmBooking}
                    onPrev={handlePrevStep}
                    canProceed={true}
                    showPrev={true}
                    nextLabel={en.booking.confirmBooking}
                    prevLabel={en.common.back}
                    isLoading={isCreatingBooking}
                  />
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar: Booking Summary */}
          <div className="lg:col-span-1">
            <BookingSummary
              service={service}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedAddress={
                selectedAddressId
                  ? addresses.find((addr) => addr.id === selectedAddressId)
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
