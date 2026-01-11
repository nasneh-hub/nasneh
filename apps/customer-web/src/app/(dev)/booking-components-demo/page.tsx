'use client';

import { useState } from 'react';
import { en } from '@nasneh/ui/copy';
import {
  DateCalendar,
  TimeSlotSelector,
  BookingSummary,
  BookingActions,
} from '@/components/booking';

/**
 * Booking Components Demo Page
 * 
 * Interactive demo of all booking components with mock data.
 * 
 * Route: /booking-components-demo (dev-only)
 */
export default function BookingComponentsDemoPage() {
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [notes, setNotes] = useState('');
  const [showState, setShowState] = useState<'loaded' | 'loading' | 'empty'>('loaded');

  // Mock dates (next 30 days)
  const mockDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    // Make some dates unavailable (randomly)
    const available = Math.random() > 0.3;
    return { date: dateStr, available };
  });

  // Mock time slots
  const mockTimeSlots = [
    { time: '09:00', available: true },
    { time: '10:00', available: false },
    { time: '11:00', available: true },
    { time: '12:00', available: true },
    { time: '13:00', available: false },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: true },
    { time: '17:00', available: false },
  ];

  // Mock service data
  const mockService = {
    name: 'Professional Haircut & Styling',
    duration: 60,
    price: 25.0,
  };

  const mockProvider = {
    name: 'Salon Excellence',
  };

  const mockLocation = '123 Main Street, Manama, Bahrain';

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--muted-foreground)]00 mb-2">
            {en.booking.pageTitle} - Components Demo
          </h1>
          <p className="text-[var(--muted-foreground)]00">
            Interactive demo of all booking components with mock data
          </p>
        </div>

        {/* State Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowState('loaded')}
            className={`px-4 py-2 rounded-xl ${
              showState === 'loaded'
                ? 'bg-primary text-primary-foreground'
                : 'bg-[var(--muted)]00 text-[var(--muted-foreground)]00'
            }`}
          >
            Loaded State
          </button>
          <button
            onClick={() => setShowState('loading')}
            className={`px-4 py-2 rounded-xl ${
              showState === 'loading'
                ? 'bg-primary text-primary-foreground'
                : 'bg-[var(--muted)]00 text-[var(--muted-foreground)]00'
            }`}
          >
            Loading State
          </button>
          <button
            onClick={() => setShowState('empty')}
            className={`px-4 py-2 rounded-xl ${
              showState === 'empty'
                ? 'bg-primary text-primary-foreground'
                : 'bg-[var(--muted)]00 text-[var(--muted-foreground)]00'
            }`}
          >
            Empty State
          </button>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* DateCalendar */}
          <div>
            <h2 className="text-xl font-semibold text-[var(--muted-foreground)]00 mb-4">
              1. DateCalendar
            </h2>
            <DateCalendar
              dates={showState === 'empty' ? [] : mockDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              isLoading={showState === 'loading'}
            />
            <div className="mt-4 p-4 bg-[var(--muted)] rounded-xl">
              <p className="text-sm text-[var(--muted-foreground)]00">
                Selected Date: {selectedDate || 'None'}
              </p>
            </div>
          </div>

          {/* TimeSlotSelector */}
          <div>
            <h2 className="text-xl font-semibold text-[var(--muted-foreground)]00 mb-4">
              2. TimeSlotSelector
            </h2>
            <TimeSlotSelector
              slots={showState === 'empty' ? [] : mockTimeSlots}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              isLoading={showState === 'loading'}
            />
            <div className="mt-4 p-4 bg-[var(--muted)] rounded-xl">
              <p className="text-sm text-[var(--muted-foreground)]00">
                Selected Time: {selectedTime || 'None'}
              </p>
            </div>
          </div>

          {/* BookingSummary */}
          <div>
            <h2 className="text-xl font-semibold text-[var(--muted-foreground)]00 mb-4">
              3. BookingSummary
            </h2>
            {selectedDate && selectedTime ? (
              <BookingSummary
                service={mockService}
                provider={mockProvider}
                date={selectedDate}
                time={selectedTime}
                location={mockLocation}
                notes={notes || undefined}
              />
            ) : (
              <div className="p-8 bg-[var(--muted)] rounded-xl text-center">
                <p className="text-[var(--muted-foreground)]00">
                  Select a date and time to see the booking summary
                </p>
              </div>
            )}
            <div className="mt-4">
              <label className="block text-sm font-medium text-[var(--muted-foreground)]00 mb-2">
                {en.booking.notes}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={en.booking.notesPlaceholder}
                className="w-full p-3 border 00 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
          </div>

          {/* BookingActions */}
          <div>
            <h2 className="text-xl font-semibold text-[var(--muted-foreground)]00 mb-4">
              4. BookingActions
            </h2>
            <div className="space-y-4">
              <BookingActions
                onBack={() => alert('Back clicked')}
                onConfirm={() => alert('Confirm clicked')}
                confirmDisabled={!selectedDate || !selectedTime}
              />
              <div className="p-4 bg-[var(--muted)] rounded-xl">
                <p className="text-sm text-[var(--muted-foreground)]00 mb-2">
                  Confirm button is disabled until date and time are selected
                </p>
              </div>
              <BookingActions
                onBack={() => alert('Back clicked')}
                onConfirm={() => alert('Confirm clicked')}
                isConfirming={true}
              />
              <div className="p-4 bg-[var(--muted)] rounded-xl">
                <p className="text-sm text-[var(--muted-foreground)]00">
                  Loading state (isConfirming=true)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current State Display */}
        <div className="p-6 bg-[var(--muted)] rounded-xl">
          <h3 className="text-lg font-semibold text-[var(--muted-foreground)]00 mb-4">
            Current State
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--muted-foreground)]00">Selected Date:</p>
              <p className="font-medium text-[var(--muted-foreground)]00">
                {selectedDate || 'Not selected'}
              </p>
            </div>
            <div>
              <p className="text-[var(--muted-foreground)]00">Selected Time:</p>
              <p className="font-medium text-[var(--muted-foreground)]00">
                {selectedTime || 'Not selected'}
              </p>
            </div>
            <div>
              <p className="text-[var(--muted-foreground)]00">Notes:</p>
              <p className="font-medium text-[var(--muted-foreground)]00">
                {notes || 'No notes'}
              </p>
            </div>
            <div>
              <p className="text-[var(--muted-foreground)]00">Can Confirm:</p>
              <p className="font-medium text-[var(--muted-foreground)]00">
                {selectedDate && selectedTime ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        {/* Component Features */}
        <div className="p-6 bg-[var(--muted)] rounded-xl">
          <h3 className="text-lg font-semibold text-[var(--muted-foreground)]00 mb-4">
            Component Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-[var(--muted-foreground)]00 mb-2">DateCalendar</h4>
              <ul className="text-sm text-[var(--muted-foreground)]00 space-y-1">
                <li>✓ Shows 30 days from today</li>
                <li>✓ Available dates are clickable</li>
                <li>✓ Unavailable dates are grayed out</li>
                <li>✓ Selected date is highlighted</li>
                <li>✓ Loading skeleton</li>
                <li>✓ Empty state message</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[var(--muted-foreground)]00 mb-2">TimeSlotSelector</h4>
              <ul className="text-sm text-[var(--muted-foreground)]00 space-y-1">
                <li>✓ Shows available time slots</li>
                <li>✓ Available slots are clickable</li>
                <li>✓ Unavailable slots are grayed out</li>
                <li>✓ Selected slot is highlighted</li>
                <li>✓ Loading skeleton</li>
                <li>✓ Empty state message</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[var(--muted-foreground)]00 mb-2">BookingSummary</h4>
              <ul className="text-sm text-[var(--muted-foreground)]00 space-y-1">
                <li>✓ Service name and duration</li>
                <li>✓ Provider name</li>
                <li>✓ Formatted date and time</li>
                <li>✓ Location/address</li>
                <li>✓ Optional notes</li>
                <li>✓ Price breakdown</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-[var(--muted-foreground)]00 mb-2">BookingActions</h4>
              <ul className="text-sm text-[var(--muted-foreground)]00 space-y-1">
                <li>✓ Back button (secondary)</li>
                <li>✓ Confirm button (primary)</li>
                <li>✓ Loading state support</li>
                <li>✓ Disabled state support</li>
                <li>✓ Custom confirm label</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
