'use client';

import { useState, useEffect } from 'react';

// Enable dynamic params for booking pages
export const dynamicParams = true;
import { useParams, useRouter } from 'next/navigation';
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

/**
 * Service Booking Page
 * 
 * 3-step booking flow:
 * Step 1: Select Date & Time
 * Step 2: Service Location (address or provider location)
 * Step 3: Review & Confirm
 * 
 * Route: /services/[id]/book
 */
export default function ServiceBookingPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  // Page state
  const [step, setStep] = useState<Step>(1);
  const [isLoadingService, setIsLoadingService] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [service, setService] = useState<Service | null>(null);
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

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      try {
        setIsLoadingService(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/services/${serviceId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError(en.service.notFound);
          } else if (response.status === 401) {
            router.push('/login');
            return;
          } else {
            setError(en.ui.error);
          }
          return;
        }

        const data = await response.json();
        setService(data.data);
      } catch (err) {
        setError(en.ui.error);
      } finally {
        setIsLoadingService(false);
      }
    };

    fetchService();
  }, [serviceId, router]);

  // Fetch availability slots
  useEffect(() => {
    if (!service) return;

    const fetchSlots = async () => {
      try {
        setIsLoadingSlots(true);
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 30);

        const start = today.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/services/${serviceId}/slots?start=${start}&end=${end}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            // Service has no availability
            setSlotsData([]);
          } else {
            setError(en.ui.error);
          }
          return;
        }

        const data = await response.json();
        setSlotsData(data.data || []);
      } catch (err) {
        setError(en.ui.error);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [service, serviceId]);

  // Fetch addresses (only for HOME service type)
  useEffect(() => {
    if (!service || service.type !== 'HOME') return;

    const fetchAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me/addresses`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          } else {
            setError(en.ui.error);
          }
          return;
        }

        const data = await response.json();
        const addressList = data.data || [];
        setAddresses(addressList);

        // Auto-select default address
        const defaultAddress = addressList.find((addr: BookingAddress) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (addressList.length > 0) {
          setSelectedAddressId(addressList[0].id);
        }
      } catch (err) {
        setError(en.ui.error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [service, router]);

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(undefined); // Reset time when date changes
  };

  // Handle step navigation
  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
    } else {
      router.push(`/services/${serviceId}`);
    }
  };

  // Handle booking creation
  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      setIsCreatingBooking(true);
      const requestBody: any = {
        serviceId,
        date: selectedDate,
        time: selectedTime,
        notes: bookingNotes || undefined,
      };

      // Add addressId only for HOME services
      if (service?.type === 'HOME' && selectedAddressId) {
        requestBody.addressId = selectedAddressId;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        } else {
          setError(en.ui.error);
          return;
        }
      }

      const data = await response.json();
      const bookingId = data.data.id;

      // Navigate to confirmation page
      router.push(`/bookings/${bookingId}/confirmation`);
    } catch (err) {
      setError(en.ui.error);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  // Get dates for DateCalendar
  const dates = slotsData.map((slot) => ({
    date: slot.date,
    available: slot.slots.some((s) => s.available),
  }));

  // Get time slots for selected date
  const selectedDateSlots =
    slotsData.find((slot) => slot.date === selectedDate)?.slots || [];

  // Check if can proceed to next step
  const canProceedStep1 = selectedDate && selectedTime;
  const canProceedStep2 =
    service?.type === 'HOME' ? selectedAddressId : true;

  // Loading state
  if (isLoadingService) {
    return (
      <div className="min-h-screen bg-mono-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-mono-200 rounded-xl animate-pulse w-48" />
          <div className="h-64 bg-mono-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <div className="min-h-screen bg-mono-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <p className="text-mono-900 mb-4">{error || en.ui.error}</p>
            <Button variant="secondary" onClick={() => router.push('/services')}>
              {en.ui.back}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mono-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-mono-900 mb-2">
            {en.booking.pageTitle}
          </h1>
          <p className="text-mono-600">{service.name}</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 ${
              step === 1 ? 'text-primary' : 'text-mono-600'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 1
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-mono-200 text-mono-600'
              }`}
            >
              1
            </div>
            <span className="font-medium">{en.booking.step1Title}</span>
          </div>
          <div className="flex-1 h-px bg-mono-300" />
          <div
            className={`flex items-center gap-2 ${
              step === 2 ? 'text-primary' : 'text-mono-600'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 2
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-mono-200 text-mono-600'
              }`}
            >
              2
            </div>
            <span className="font-medium">{en.booking.step2Title}</span>
          </div>
          <div className="flex-1 h-px bg-mono-300" />
          <div
            className={`flex items-center gap-2 ${
              step === 3 ? 'text-primary' : 'text-mono-600'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 3
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-mono-200 text-mono-600'
              }`}
            >
              3
            </div>
            <span className="font-medium">{en.booking.step3Title}</span>
          </div>
        </div>

        {/* Step 1: Select Date & Time */}
        {step === 1 && (
          <div className="space-y-6">
            <DateCalendar
              dates={dates}
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              isLoading={isLoadingSlots}
            />

            {selectedDate && (
              <TimeSlotSelector
                slots={selectedDateSlots}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
                isLoading={false}
              />
            )}

            <BookingActions
              onBack={handleBack}
              onConfirm={handleNext}
              confirmDisabled={!canProceedStep1}
              confirmLabel={en.ui.next}
            />
          </div>
        )}

        {/* Step 2: Service Location */}
        {step === 2 && (
          <div className="space-y-6">
            {service.type === 'HOME' ? (
              <>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {en.booking.selectAddress}
                  </h3>
                  <AddressSelector
                    addresses={addresses}
                    selectedAddressId={selectedAddressId}
                    onSelectAddress={setSelectedAddressId}
                    onAddNewAddress={() => {
                      // TODO: Navigate to add address page in future PR
                      alert('Add address functionality coming soon');
                    }}
                  />
                </Card>
              </>
            ) : (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {en.booking.providerLocation}
                </h3>
                <div className="space-y-2">
                  <p className="font-medium text-mono-900">
                    {service.provider.name}
                  </p>
                  {service.provider.location && (
                    <p className="text-mono-600">
                      {service.provider.location}
                    </p>
                  )}
                </div>
              </Card>
            )}

            <BookingActions
              onBack={handleBack}
              onConfirm={handleNext}
              confirmDisabled={!canProceedStep2}
              confirmLabel={en.ui.next}
            />
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <BookingSummary
              service={{
                name: service.name,
                duration: service.duration,
                price: service.price,
              }}
              provider={{
                name: service.provider.name,
              }}
              date={selectedDate!}
              time={selectedTime!}
              location={
                service.type === 'HOME'
                  ? addresses.find((a) => a.id === selectedAddressId)?.label ||
                    ''
                  : service.provider.location || ''
              }
              notes={bookingNotes}
            />

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {en.booking.notes}
              </h3>
              <textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder={en.booking.notesPlaceholder}
                className="w-full min-h-32 p-3 rounded-xl border border-mono-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                maxLength={500}
              />
              <p className="text-sm text-mono-600 mt-2">
                {bookingNotes.length}/500 characters
              </p>
            </Card>

            <BookingActions
              onBack={handleBack}
              onConfirm={handleConfirmBooking}
              confirmDisabled={isCreatingBooking}
              confirmLabel={en.booking.confirmBooking}
              isConfirming={isCreatingBooking}
            />
          </div>
        )}
      </div>
    </div>
  );
}
